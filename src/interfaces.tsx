export interface TaxonomyEntry {
  comName: string;
  sciName: string;
  speciesCode: string;
}

export type Taxonomy = TaxonomyEntry[];

export type PotentialError = null | Error;

export interface SearchAttributes {
  areaCode: string | null;
  speciesCode: string | null;
  lattitude: number | null;
  longitude: number | null;
  searchNotable: Boolean;
}

export interface SelectedSpecies {
  name: string | null;
  code: string | null;
}