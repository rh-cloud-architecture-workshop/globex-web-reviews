# GlobexWeb

Run `npm run dev:ssr` for running this as server side app. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


# Mock APIs server

Read https://github.com/jayachristina/globex-mock-api-server for running a mock server

## Env variables needed
Run the globex-store  globex-db images locally and setup these URLs

export API_TRACK_USERACTIVITY="http://localhost:3000/track"
export API_GET_PAGINATED_PRODUCTS="http://localhost:3000/services/catalog/product"
export API_GET_PRODUCT_DETAILS_BY_IDS="http://localhost:3000/services/catalog/product/:ids" 
export API_CATALOG_RECOMMENDED_PRODUCT_IDS="http://localhost:9000/score/product"
export API_CART_SERVICE="http://localhost:3000/services/cart"
export API_CUSTOMER_SERVICE="http://localhost:3000/services/customer/id/:custId"
export API_ORDER_SERVICE="http://localhost:8080/web-gateway/services/order"

### reviews specific
export API_SAVE_PROD_REVIEW = "http://localhost:3000/review/submit"
export API_FETCH_PROD_REVIEW="http://localhost:3000/reviews/list"
export API_FETCH_PROD_REVIEWS_SUMMARY="http://localhost:3000/reviews/summary"
  
export SSO_CUSTOM_CONFIG="globex-web-gateway"
export SSO_AUTHORITY="http://localhost:8080/realms/globex"
export SSO_REDIRECT_LOGOUT_URI="http://localhost:4200/home"
export SSO_LOG_LEVEL=2

# Run Keycloak for Dev
```
 podman run -p 127.0.0.1:8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:26.3.5 start-dev
```

. Login http://0.0.0.0:8080 with admin/admin 
. Create new realm called `globex`
. create user asilva/openshift
. create client `globex-web-gateway` - set *Client authentication* as ON, and  Authentication flow > *Implicit flow* as ON. 

-  Web origins : http://localhost:4200
- Valid redirect URIs: http://localhost:4200/home



## docker

podman build --platform=linux/amd64 -t quay.io/cloud-architecture-workshop/globex-web-reviews:rating . 
podman push quay.io/cloud-architecture-workshop/globex-web-reviews:rating

