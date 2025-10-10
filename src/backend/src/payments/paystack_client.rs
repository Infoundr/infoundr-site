use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpMethod, HttpResponse, HttpHeader,
    TransformContext, TransformFunc,
};
use crate::payments::paystack_models::{
    InitializeTransactionRequest, InitializeTransactionResponse, VerifyTransactionResponse,
};
use crate::payments::get_secret_key;
use serde_json;

const PAYSTACK_API_BASE: &str = "https://api.paystack.co";
const MAX_RESPONSE_BYTES: u64 = 2_000_000; // 2MB
const CYCLES_PER_CALL: u128 = 13_000_000_000; // ~13B cycles per HTTP call

/// Initialize a payment transaction with Paystack
pub async fn initialize_transaction(
    request: InitializeTransactionRequest,
) -> Result<InitializeTransactionResponse, String> {
    let secret_key = get_secret_key();
    if secret_key.is_empty() {
        return Err("Paystack not configured. Please set API keys.".to_string());
    }

    // Serialize request body
    let body = serde_json::to_string(&request)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;

    // Prepare headers
    let headers = vec![
        HttpHeader {
            name: "Authorization".to_string(),
            value: format!("Bearer {}", secret_key),
        },
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
    ];

    // Build HTTP request
    let url = format!("{}/transaction/initialize", PAYSTACK_API_BASE);
    
    let request = CanisterHttpRequestArgument {
        url: url.clone(),
        method: HttpMethod::POST,
        body: Some(body.into_bytes()),
        max_response_bytes: Some(MAX_RESPONSE_BYTES),
        transform: Some(TransformContext {
            function: TransformFunc(candid::Func {
                principal: ic_cdk::api::id(),
                method: "transform_payment_http_response".to_string(),
            }),
            context: vec![],
        }),
        headers,
    };

    // Make HTTP outcall
    match http_request(request, CYCLES_PER_CALL).await {
        Ok((response,)) => {
            parse_initialize_response(response)
        }
        Err((code, msg)) => {
            Err(format!("HTTP request failed: {:?} - {}", code, msg))
        }
    }
}

/// Verify a payment transaction with Paystack
pub async fn verify_transaction(reference: String) -> Result<VerifyTransactionResponse, String> {
    let secret_key = get_secret_key();
    if secret_key.is_empty() {
        return Err("Paystack not configured. Please set API keys.".to_string());
    }

    // Prepare headers
    let headers = vec![
        HttpHeader {
            name: "Authorization".to_string(),
            value: format!("Bearer {}", secret_key),
        },
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/json".to_string(),
        },
    ];

    // Build HTTP request
    let url = format!("{}/transaction/verify/{}", PAYSTACK_API_BASE, reference);

    let request = CanisterHttpRequestArgument {
        url: url.clone(),
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: Some(MAX_RESPONSE_BYTES),
        transform: Some(TransformContext {
            function: TransformFunc(candid::Func {
                principal: ic_cdk::api::id(),
                method: "transform_payment_http_response".to_string(),
            }),
            context: vec![],
        }),
        headers,
    };
    ic_cdk::println!("Request: {:?}", request);

    // Make HTTP outcall
    match http_request(request, CYCLES_PER_CALL).await {
        Ok((response,)) => {
            parse_verify_response(response)
        }
        Err((code, msg)) => {
            ic_cdk::println!("HTTP request failed: {:?} - {}", code, msg);
            Err(format!("HTTP request failed: {:?} - {}", code, msg))
        }
    }
}

/// Parse the initialization response
fn parse_initialize_response(response: HttpResponse) -> Result<InitializeTransactionResponse, String> {
    // Check status code
    if response.status != 200u32 && response.status != 201u32 {
        return Err(format!(
            "Paystack API returned status {}: {}",
            response.status,
            String::from_utf8_lossy(&response.body)
        ));
    }

    // Parse JSON response
    let response_text = String::from_utf8(response.body)
        .map_err(|e| format!("Invalid UTF-8 in response: {}", e))?;

    serde_json::from_str::<InitializeTransactionResponse>(&response_text)
        .map_err(|e| format!("Failed to parse response: {}. Response: {}", e, response_text))
}

/// Parse the verification response
fn parse_verify_response(response: HttpResponse) -> Result<VerifyTransactionResponse, String> {
    // Check status code
    if response.status != 200u32 {
        ic_cdk::println!("Paystack API returned status {}: {}", response.status, String::from_utf8_lossy(&response.body));
        return Err(format!(
            "Paystack API returned status {}: {}",
            response.status,
            String::from_utf8_lossy(&response.body)
        ));
    }

    // Parse JSON response
    let response_text = String::from_utf8(response.body)
        .map_err(|e| format!("Invalid UTF-8 in response: {}", e))?;
    ic_cdk::println!("Response converted to string on parse_verify_response: {:?}", response_text);

    serde_json::from_str::<VerifyTransactionResponse>(&response_text)
        .map_err(|e| format!("Failed to parse response: {}. Response: {}", e, response_text))
}

/// Helper to build metadata JSON string
pub fn build_metadata(
    user_id: &str,
    tier: &str,
    billing_period: &str,
    phone: Option<String>,
) -> String {
    let metadata = serde_json::json!({
        "user_id": user_id,
        "tier": tier,
        "billing_period": billing_period,
        "phone": phone,
        "source": "infoundr_platform"
    });
    
    serde_json::to_string(&metadata).unwrap_or_default()
}

/// Helper to determine which payment channels to enable
pub fn get_payment_channels(include_mpesa: bool, include_card: bool) -> Vec<String> {
    let mut channels = Vec::new();
    
    if include_card {
        channels.push("card".to_string());
    }
    
    if include_mpesa {
        channels.push("mobile_money".to_string());
    }
    
    // You can add more channels as needed
    // channels.push("bank_transfer".to_string());
    // channels.push("ussd".to_string());
    
    if channels.is_empty() {
        // Default to card if nothing specified
        channels.push("card".to_string());
    }
    
    channels
}

