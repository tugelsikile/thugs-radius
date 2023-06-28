export const config = (props) => {
    return {
        merchantCode : props.merchant_code,
        apiKey : props.api_key,
        passport : true,
        callbackUrl : "https://example/route/callback",
        returnUrl : "https://example/route/return",
        accountLinkReturnUrl : "https://localhost/dashboard/user",
        expiryPeriod: 1440
    };
}
