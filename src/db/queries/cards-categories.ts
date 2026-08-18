import { asc, eq } from 'drizzle-orm';

import type { Database } from '../client';
import {
  cards,
  categories,
  type Card,
  type Category,
  type NewCard,
  type NewCategory,
} from '../schema';

export type CreateCardInput = Omit<NewCard, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateCategoryInput = Omit<
  NewCategory,
  'id' | 'createdAt' | 'updatedAt'
>;

export async function listCards(database: Database): Promise<Card[]> {
  return database.select().from(cards).orderBy(asc(cards.name));
}

export async function addCard(
  database: Database,
  input: CreateCardInput,
): Promise<Card> {
  const now = new Date().toISOString();
  const [created] = await database
    .insert(cards)
    .values({ ...input, createdAt: now, updatedAt: now })
    .returning();

  if (!created) {
    throw new Error('Card could not be created');
  }

  return created;
}

export async function removeCard(database: Database, id: number): Promise<void> {
  const [removed] = await database
    .delete(cards)
    .where(eq(cards.id, id))
    .returning({ id: cards.id });

  if (!removed) {
    throw new Error('Card not found');
  }
}

export async function listCategories(database: Database): Promise<Category[]> {
  return database.select().from(categories).orderBy(asc(categories.name));
}

export async function addCategory(
  database: Database,
  input: CreateCategoryInput,
): Promise<Category> {
  const now = new Date().toISOString();
  const [created] = await database
    .insert(categories)
    .values({ ...input, createdAt: now, updatedAt: now })
    .returning();

  if (!created) {
    throw new Error('Category could not be created');
  }

  return created;
}

export async function removeCategory(
  database: Database,
  id: number,
): Promise<void> {
  const [removed] = await database
    .delete(categories)
    .where(eq(categories.id, id))
    .returning({ id: categories.id });

  if (!removed) {
    throw new Error('Category not found');
  }
}