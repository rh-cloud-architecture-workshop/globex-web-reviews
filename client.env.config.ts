

const envClientConfig = {

    
  //client UI to SSR calls
  ANGULR_API_GETPAGINATEDPRODUCTS: '/api/getPaginatedProducts',
  ANGULR_API_GETPAGINATEDPRODUCTS_LIMIT: 8,
  ANGULR_API_GETRECOMMENDEDPRODUCTS: '/api/getRecommendedProducts',
  ANGULR_API_TRACKUSERACTIVITY: '/api/trackUserActivity',
  ANGULR_API_GETPRODUCTDETAILS_FOR_IDS: '/api/getProductDetailsForIds',
  ANGULR_API_CART: '/api/cart',
  ANGULR_API_LOGIN: '/api/login',
  ANGULR_API_CUSTOMER: '/api/customer',
  ANGULAR_API_ORDER: '/api/order',
  ANGULAR_API_AUTHCONFIG: '/api/getAuthConfig',
  SSO_CUSTOM_CONFIG_KEY: "SSO_CUSTOM_CONFIG_KEY",
  SSO_AUTHORITY_KEY: "SSO_AUTHORITY_KEY",
  SSO_REDIRECT_LOGOUT_URI_KEY: "SSO_REDIRECT_LOGOUT_URI_KEY",  
  SSO_LOG_LEVEL_KEY: "SSO_LOG_LEVEL_KEY",
  ANGULR_API_SAVE_PROD_REVIEW : '/api/saveProductReview',
  ANGULR_API_FETCH_PROD_REVIEWS : '/api/fetchProductReview',
  ANGULR_API_FETCH_PROD_REVIEWS_SUMMARY : '/api/fetchProductReviewsSummary'
        
}

export default envClientConfig;