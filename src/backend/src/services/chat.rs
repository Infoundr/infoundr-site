use crate::models::chat::{ChatMessage, BotType};
use crate::storage::memory::{CHAT_HISTORY, USERS};
use crate::models::stable_principal::StablePrincipal;
use ic_cdk::update;

#[update]
pub fn add_chat_message(content: String, bot_type: BotType) -> Result<ChatMessage, String> {
    let caller = ic_cdk::caller();
    if !USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(caller))) {
        return Err("User not registered".to_string());
    }

    let timestamp = ic_cdk::api::time();
    let message = ChatMessage {
        user_principal: StablePrincipal::new(caller),
        content,
        timestamp,
        bot_type,
    };

    CHAT_HISTORY.with(|history| {
        history.borrow_mut().insert((StablePrincipal::new(caller), timestamp), message.clone())
    });
    Ok(message)
} 