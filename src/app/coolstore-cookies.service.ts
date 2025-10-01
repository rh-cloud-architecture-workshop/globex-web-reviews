import { ToastrService } from 'ngx-toastr';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ActionInfo, Activity, UserActivityModel, UserInfo } from './models/user-activity.model';
import {v4 as uuidv4} from 'uuid';
import { GlobexConstants } from './core/constants/globex.constants';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HandleError, HttpErrorHandler } from './http-error-handler.service';
import { catchError, Observable, timestamp } from 'rxjs';
import serverEnvConfig from 'client.env.config';
import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root'
})

export class CoolstoreCookiesService {
  cookieService: CookieService;
  likeProductsListFromCookie = new Array;
  userDetailsMap = new Map;
  userDetailsFromCookie;
  private handleError: HandleError;
  http: HttpClient;
  userActivityObj;

  paginationLimit = serverEnvConfig.ANGULR_API_GETPAGINATEDPRODUCTS_LIMIT; //number of products per page

  constructor(cookieService: CookieService, private route: ActivatedRoute, http: HttpClient, httpErrorHandler: HttpErrorHandler, 
    private customerService: CustomerService, private toastr: ToastrService) {

    this.cookieService = cookieService;
    this.http = http;
    this.handleError = httpErrorHandler.createHandleError('CoolstoreCookiesService');
    this.initialize();
  }

  initialize() {
    this.cookieService.delete('globex_session_token');
    this.getUserDetailsFromCookie();
  }

  getUserDetailsFromCookie() {

    this.userDetailsFromCookie = this.cookieService.get('userDetailsMap');


    if(!this.cookieService.check('userDetailsMap')) {
      this.userDetailsMap["firstVisitTs"] = new Date().getTime().toString();
      this.userDetailsMap["prevVisitTs"]= new Date().getTime().toString();
      this.userDetailsMap["currentVisitTs"]= new Date().getTime().toString();
      this.userDetailsMap["userId"] = uuidv4();
      this.userDetailsMap["newVisit"] = 1;
      this.userDetailsMap["visitsCount"] = 1;
      this.cookieService.set('userDetailsMap', JSON.stringify(this.userDetailsMap));
    } else {
      this.userDetailsMap = JSON.parse(this.userDetailsFromCookie);
      this.userDetailsMap["prevVisitTs"] = this.userDetailsMap["currentVisitTs"];
      this.userDetailsMap["currentVisitTs"] = new Date().getTime().toString();
      this.userDetailsMap["newVisit"] = 0;

      var visitsCount = this.userDetailsMap["visitsCount"];
      this.userDetailsMap["visitsCount"] = visitsCount ? visitsCount+1 : 1;

      this.cookieService.set('userDetailsMap', JSON.stringify(this.userDetailsMap));
    }
  }

  retrieveUserDetailsFromCookie() {
    return  this.userDetailsMap;
  }

  saveUserLike(event, product) {
    product.liked = true;
    var productLikesCookieValue = this.cookieService.get('productLikes')
    var likedProductsList = [];
    if(productLikesCookieValue!=='') {
      likedProductsList = productLikesCookieValue.split(',');
    }
    likedProductsList.push(product.itemId)
    likedProductsList= likedProductsList.filter((item, i, ar) => ar.indexOf(item) === i);
    this.cookieService.set('productLikes', likedProductsList.toString());


    this.userActivityObj = new UserActivityModel(
                              GlobexConstants.General.SITE_ID,
                              new Activity(
                                this.userDetailsMap["userId"],
                                this.route.snapshot.url.toString(),
                                uuidv4(),
                                GlobexConstants.General.USER_ACTIVITY_LIKE
                                ) ,
                              new UserInfo(
                                this.userDetailsMap["visitsCount"], //visitsCount
                                new Date().getTime(), //prevVisitTs
                                new Date().getTime(), //firstVisitTs
                                GlobexConstants.General.CAMPAIGN,
                                this.userDetailsMap["newVisit"],  //0 for NO, 1 for YES
                                this.dateToFormattedString() //localTime
                              ),
                              new ActionInfo(product.itemId, '', '')
                              )

        this.saveUserActivityPost().subscribe(response => {});

  }

  submitReview(product,reviewText, rating, user) {

    var timestamp = new Date().toISOString()

    let prodReviewObj = {
      "product" : {
        "product_id": product.itemId,
        "product_name": product.name,
        "category": product.category
      }
      ,
      "user": {
        "name": "",
        "customer_id": "",
        "browser": "Chrome",
        "region": "India"
      },
      "rating": rating,
      "timestamp": timestamp.split('.')[0] + 'Z',
      "review_text": reviewText
      
    }
    console.log("prodReviewObj before sending", prodReviewObj)
    
    this.customerService.getCustomerInfo(user)
      .subscribe(c => {
        prodReviewObj.user.name =  c.firstName + " " + c.lastName;
        prodReviewObj.user.customer_id = user;
        prodReviewObj.user.region = c.address.country;
        this.saveReview(prodReviewObj).subscribe(response => {
          console.log("CoolstoreService >> submitReview >> resonse", response)
          this.toastr.success('Your review has been submitted!', 'Thank you');
  
      });
        
      })
    

    
  }

  saveReview(prodReviewObj): Observable<any> {
    var reviewObj = {"id": uuidv4(), 
                      "user": prodReviewObj.user.customer_id, 
                      "product_code": prodReviewObj.product.product_id, 
                      "product": prodReviewObj.product.product_name, 
                       "stars": prodReviewObj.rating, 
                       "review": prodReviewObj.review_text, 
                       "created": prodReviewObj.timestamp};
    console.log("prodReviewObj to be sent", reviewObj)
    return this.http.post<any>(serverEnvConfig.ANGULR_API_SAVE_PROD_REVIEW, reviewObj)
      .pipe(catchError(this.handleError('reviewObj', reviewObj)));
  }



  fetchReviews(itemId, page): Observable<any> {
    return this.http.get<any>(serverEnvConfig.ANGULR_API_FETCH_PROD_REVIEWS + "/" + itemId +"?page="+page + "&limit="+this.paginationLimit )
      .pipe(catchError(this.handleError('prodReviewObj', itemId)));

      
  }

  getReviewsSummary(itemId): Observable<any> {
    return this.http.get<any>(serverEnvConfig.ANGULR_API_FETCH_PROD_REVIEWS_SUMMARY + "/" + itemId)
      .pipe(catchError(this.handleError('prodReviewObj', itemId)));
  }


  saveUserActivityPostUrl = serverEnvConfig.ANGULR_API_TRACKUSERACTIVITY;  // URL to web api
  saveUserActivityPost(): Observable<UserActivityModel> {
    return this.http.post<UserActivityModel>(this.saveUserActivityPostUrl, this.userActivityObj)
      .pipe(catchError(this.handleError('userActivityObj', this.userActivityObj)));
  }


  dateToFormattedString() {
    return new Date(new Date().toString().split('GMT')[0]+' UTC').toISOString();
  };



  getAllProductLikes(){
     var productLikesCookieValue = this.cookieService.get('productLikes');
     this.likeProductsListFromCookie = productLikesCookieValue.split(',');
   }

   setupSingleProductForLike(currentProduct){
    if(this.likeProductsListFromCookie.indexOf(currentProduct.id) !== -1){
      currentProduct.liked = true;
    }
  }


  removeProductLike(event, currentProduct){
    currentProduct.liked = false;
      this.likeProductsListFromCookie.forEach((element,index)=>{
      if(element===currentProduct.itemId) {
        this.likeProductsListFromCookie.splice(index,1);
        currentProduct.liked = false;
      }
   });
   this.cookieService.set('productLikes', this.likeProductsListFromCookie.toString());
  }

  isProductLiked(currentProductId){
    this.getAllProductLikes();
    if(this.likeProductsListFromCookie.indexOf(currentProductId) !== -1){
      return true;
    } else {
      return false;
    }
  }

  resetUser() {
    this.cookieService.delete('globex_session_token');
  }

  getSession() {
    if (this.cookieService.check('globex_session_token')) {
      return this.cookieService.get('globex_session_token');
    }
    return null;
  }
}


/**
 * generate groups of 4 random characters
 * @example getUniqueId(1) : 607f
 * @example getUniqueId(2) : 95ca-361a-f8a1-1e73
 */
 export function getUniqueId(parts: number): string {
  const stringArr = [];
  for(let i = 0; i< parts; i++){
    // tslint:disable-next-line:no-bitwise
    const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    stringArr.push(S4);
  }
  return stringArr.join('-');
}