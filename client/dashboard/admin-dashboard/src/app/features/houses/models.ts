export interface HouseSummaryDto {
  houseId: string;
  name: string;
  houseTypeName?: string | null;
  city?: string | null;
  country?: string | null;
  photos: HousePhotoDto[];
}

export interface HouseListQuery {
  page: number;
  pageSize: number;
  sortBy?: string | null;
  search?: string | null;
}

export interface HousePhotoDto {
  photoId: string;
  label: string;
  sortOrder: number;
  permanentRelativePath: string;
}

export interface HouseDetailDto {
  houseId: string;
  name: string;
  description?: string | null;
  houseTypeName?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postalCode?: string | null;
  photos: HousePhotoDto[];
}

export interface AddressRequest {
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  country: string;
  postalCode?: string | null;
}

export interface HouseCommitPhotoItem {
  stagedUploadId: string;
  label: string;
  sortOrder: number;
}

export interface CreateHouseRequest {
  name: string;
  description?: string | null;
  houseTypeName: string;
  address: AddressRequest;
  photos?: HouseCommitPhotoItem[] | null;
}

export interface UpdateHouseRequest extends CreateHouseRequest {}

export interface StageUploadResponse {
  stagedUploadId: string;
  tempRelativePath: string;
  uuidFileName: string;
  extension: string;
  contentType: string;
  fileSize: number;
  createdAtUtc: string;
  expiresAtUtc: string;
  targetType: string;
}
