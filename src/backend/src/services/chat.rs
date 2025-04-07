use crate::models::chat::{BotType, ChatMessage, MessageRole};
use crate::models::stable_principal::StablePrincipal;
use crate::storage::memory::{CHAT_HISTORY, USERS};
use ic_cdk::update;

#[update]
pub fn add_chat_message(content: String, bot_type: BotType) -> Result<ChatMessage, String> {
    let caller = ic_cdk::caller();
    if !USERS.with(|users| users.borrow().contains_key(&StablePrincipal::new(caller))) {
        return Err("User not registered".to_string());
    }

    let timestamp = ic_cdk::api::time();
    let message = ChatMessage {
        id: caller,
        role: MessageRole::User,
        content,
        question_asked: None,
        timestamp,
        bot_name: Some(bot_type.to_string()),
    };

    CHAT_HISTORY.with(|history| {
        history
            .borrow_mut()
            .insert((StablePrincipal::new(caller), timestamp), message.clone())
    });
    Ok(message)
}
