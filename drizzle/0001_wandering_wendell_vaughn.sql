CREATE TABLE `recurring_expense_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`amount_in_cents` integer NOT NULL,
	`category` text NOT NULL,
	`merchant` text,
	`payment_method` text,
	`card_id` text,
	`payment_modality` text,
	`next_occurrence_date` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "recurring_expenses_amount_positive" CHECK("recurring_expense_rules"."amount_in_cents" > 0)
);
--> statement-breakpoint
CREATE INDEX `recurring_expenses_due_idx` ON `recurring_expense_rules` (`is_active`,`next_occurrence_date`);--> statement-breakpoint
ALTER TABLE `transactions` ADD `recurring_rule_id` integer;--> statement-breakpoint
ALTER TABLE `transactions` ADD `installment_group_id` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `installment_number` integer;--> statement-breakpoint
ALTER TABLE `transactions` ADD `installment_count` integer;--> statement-breakpoint
CREATE INDEX `transactions_recurring_rule_idx` ON `transactions` (`recurring_rule_id`);--> statement-breakpoint
CREATE INDEX `transactions_installment_group_idx` ON `transactions` (`installment_group_id`);