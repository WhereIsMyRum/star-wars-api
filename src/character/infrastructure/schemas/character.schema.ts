import { Schema } from 'mongoose';

import { Episodes } from '../../domain/episodes';

export const CharacterSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  episodes: { type: [String], enum: Episodes, default: [] },
  planet: { type: String, default: null },
});
