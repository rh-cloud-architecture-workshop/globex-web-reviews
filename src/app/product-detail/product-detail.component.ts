import { Component, OnInit, Inject, PLATFORM_ID  } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../cart.service';
import { CoolstoreCookiesService } from '../coolstore-cookies.service';
import { CoolStoreProductsService } from '../coolstore-products.service';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LoginService } from '../login.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  likeProductsListFromCookie = new Array;
  coolStoreService:CoolStoreProductsService;
  cookieService: CookieService;
  cartService:CartService;
  coolstoreCookiesService:CoolstoreCookiesService;
  loginService: LoginService;
  
  productIdFromRoute:string;  
  currentProduct;
  isProductLiked = false;
  testBrowser: boolean;
  reviewText="";
  
  constructor(coolStoreService:CoolStoreProductsService, cookieService: CookieService, loginService: LoginService, private router: Router,
    coolstoreCookiesService:CoolstoreCookiesService, cartService:CartService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId:string) {
    this.coolStoreService = coolStoreService;
    this.cartService = cartService;
    this.cookieService = cookieService;
    this.coolstoreCookiesService = coolstoreCookiesService;
    this.testBrowser = isPlatformBrowser(platformId);
    this.loginService = loginService;
  }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    console.log("routeParams", routeParams)
    this.productIdFromRoute = String(routeParams.get('itemId'));
    console.log("productIdFromRoute", this.productIdFromRoute)
    if (this.testBrowser) {
      this.getProductDetails();
      this.fetchReview(this.productIdFromRoute);
      interval(5000).subscribe(x => {
        this.fetchReview(this.productIdFromRoute);
      });
      
    }    
  }

  
  getProductDetails() {
    this.coolStoreService.getProductDetailsByIds(this.productIdFromRoute)
    .subscribe(product => {
      this.currentProduct = product[0]; 
      this.setupProductLikes();
      console.log("this.currentProduct ", this.currentProduct)
    } 
    );            
  }
 
   setupProductLikes(){
    this.isProductLiked = this.coolstoreCookiesService.isProductLiked(this.currentProduct.itemId);
   }
 
   saveUserLike(event, product) {
     this.coolstoreCookiesService.saveUserLike(event, product);
     this.isProductLiked = true;

  }

  submitReview() {
    this.coolstoreCookiesService.submitReview(this.currentProduct, this.reviewText,this.loginService.getAuthenticatedUser());    
    this.reviewText = '';
  }
  
  reviewsList;
  fetchReview(productIdFromRoute) {
    
        this.coolstoreCookiesService.getReviews(productIdFromRoute).subscribe(response => {
          this.reviewsList = response
          console.log("this.reviewsList", this.reviewsList)
        });    
      
    
    
  }
   
  removeProductLike(event, product) {
    this.coolstoreCookiesService.removeProductLike(event, product);
    this.isProductLiked = false;
}
  
   addToCart(event, product) {
     this.cartService.addProductToCart(product);
     console.log(product);
   }
}
