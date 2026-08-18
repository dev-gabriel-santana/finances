ALTER TABLE `recurring_expense_rules` ADD `occurrence_day` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `recurring_expense_rules` ADD `invoice_due_day` integer;