PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recurring_expense_rules` (
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
	`occurrence_day` integer DEFAULT 1 NOT NULL,
	`next_invoice_due_date` text,
	`invoice_due_day` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "recurring_expenses_amount_positive" CHECK("amount_in_cents" > 0)
);
--> statement-breakpoint
INSERT INTO `__new_recurring_expense_rules`("id", "title", "description", "amount_in_cents", "category", "merchant", "payment_method", "card_id", "payment_modality", "next_occurrence_date", "occurrence_day", "next_invoice_due_date", "invoice_due_day", "is_active", "created_at", "updated_at") SELECT "id", "title", "description", "amount_in_cents", "category", "merchant", "payment_method", "card_id", "payment_modality", "next_occurrence_date", "occurrence_day", "next_invoice_due_date", "invoice_due_day", "is_active", "created_at", "updated_at" FROM `recurring_expense_rules`;--> statement-breakpoint
DROP TABLE `recurring_expense_rules`;--> statement-breakpoint
ALTER TABLE `__new_recurring_expense_rules` RENAME TO `recurring_expense_rules`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `recurring_expenses_due_idx` ON `recurring_expense_rules` (`is_active`,`next_occurrence_date`);