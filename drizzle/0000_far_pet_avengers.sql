CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`amount_in_cents` integer NOT NULL,
	`category` text NOT NULL,
	`transaction_date` text NOT NULL,
	`merchant` text,
	`payment_method` text,
	`card_id` text,
	`payment_modality` text,
	`invoice_due_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "transactions_amount_positive" CHECK("transactions"."amount_in_cents" > 0),
	CONSTRAINT "transactions_type_valid" CHECK("transactions"."type" in ('income', 'expense')),
	CONSTRAINT "transactions_payment_method_valid" CHECK("transactions"."payment_method" is null or "transactions"."payment_method" in ('card', 'cash', 'pix')),
	CONSTRAINT "transactions_payment_modality_valid" CHECK("transactions"."payment_modality" is null or "transactions"."payment_modality" in ('debit', 'credit'))
);
--> statement-breakpoint
CREATE INDEX `transactions_date_idx` ON `transactions` (`transaction_date`);--> statement-breakpoint
CREATE INDEX `transactions_type_date_idx` ON `transactions` (`type`,`transaction_date`);--> statement-breakpoint
CREATE INDEX `transactions_category_idx` ON `transactions` (`category`);