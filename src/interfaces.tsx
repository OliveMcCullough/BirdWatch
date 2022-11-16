export interface TaxonomyEntry {
  comName: string;
  sciName: string;
  speciesCode: string;
}

export type Taxonomy = TaxonomyEntry[];

export interface SearchAttributes {
  areaCode: string | undefined;
  speciesCode: string | undefined;
  lattitude: number | undefined;
  longitude: number | undefined;
  searchNotable: Boolean;
}

export interface SelectedSpecies {
  name: string | undefined;
  code: string | undefined;
}