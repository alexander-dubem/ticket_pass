#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address, Symbol, symbol_short};

#[contract]
pub struct TicketPassContract;

const LEDGER_THRESHOLD_BUMP: u32 = 17280; // ~1 day in ledgers
const LEDGER_BUMP_TO: u32 = 777600;       // ~45 days in ledgers

#[contractimpl]
impl TicketPassContract {
    // Initializer/configuration can be stored in instance storage
    pub fn initialize(env: Env, admin: Address, capacity: u32, original_price: u128, max_premium_pct_scaled: u128) {
        admin.require_auth();
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("capacity"), &capacity);
        env.storage().instance().set(&symbol_short!("price"), &original_price);
        env.storage().instance().set(&symbol_short!("premium"), &max_premium_pct_scaled);
        env.storage().instance().set(&symbol_short!("sold"), &0u32);
    }

    pub fn mint_ticket(env: Env, buyer: Address, ticket_id: u32, idempotency_key: Symbol) {
        buyer.require_auth();
        
        // 1. Enforce Idempotency
        if env.storage().temporary().has(&idempotency_key) {
            panic!("Duplicate transaction detected!");
        }
        env.storage().temporary().set(&idempotency_key, &true);
        // Expiration for 1 hour (~720 ledgers at 5s/ledger)
        env.storage().temporary().extend_ttl(&idempotency_key, 720, 720);

        // 2. Check capacity
        let sold: u32 = env.storage().instance().get(&symbol_short!("sold")).unwrap_or(0);
        let capacity: u32 = env.storage().instance().get(&symbol_short!("capacity")).unwrap_or(0);
        if sold >= capacity {
            panic!("Event is sold out");
        }

        // 3. Store ticket ownership
        let ticket_key = (symbol_short!("ticket"), ticket_id);
        if env.storage().persistent().has(&ticket_key) {
            panic!("Ticket already minted");
        }
        env.storage().persistent().set(&ticket_key, &buyer);
        
        // Extend TTL
        env.storage().persistent().extend_ttl(
            &ticket_key, 
            LEDGER_THRESHOLD_BUMP, 
            LEDGER_BUMP_TO
        );

        // Increment sold count
        env.storage().instance().set(&symbol_short!("sold"), &(sold + 1));
    }

    pub fn transfer_ticket(env: Env, from: Address, to: Address, ticket_id: u32, resale_price: u128) {
        from.require_auth();
        
        let ticket_key = (symbol_short!("ticket"), ticket_id);
        if !env.storage().persistent().has(&ticket_key) {
            panic!("Ticket does not exist");
        }
        
        let current_owner: Address = env.storage().persistent().get(&ticket_key).unwrap();
        if current_owner != from {
            panic!("Not the ticket owner");
        }

        // Enforce anti-scalping price cap
        let original_price: u128 = env.storage().instance().get(&symbol_short!("price")).unwrap_or(0);
        let max_premium_pct_scaled: u128 = env.storage().instance().get(&symbol_short!("premium")).unwrap_or(0);
        let max_resale_price = Self::calculate_max_resale_price(original_price, max_premium_pct_scaled);
        
        if resale_price > max_resale_price {
            panic!("Resale price exceeds maximum allowed premium cap");
        }

        env.storage().persistent().set(&ticket_key, &to);
        env.storage().persistent().extend_ttl(
            &ticket_key, 
            LEDGER_THRESHOLD_BUMP, 
            LEDGER_BUMP_TO
        );
    }

    pub fn calculate_max_resale_price(original_price: u128, max_premium_pct_scaled: u128) -> u128 {
        // Premium percentage is scaled by 1000 (e.g., 15% premium = 150)
        let premium = (original_price * max_premium_pct_scaled) / 1000;
        original_price + premium
    }

    pub fn get_owner(env: Env, ticket_id: u32) -> Option<Address> {
        let ticket_key = (symbol_short!("ticket"), ticket_id);
        env.storage().persistent().get(&ticket_key)
    }
}
