import { Role, OrderStatus, DiscountType } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateRestaurantInput {
  name: string;
  description?: string;
  phone?: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  fssaiLicenseNumber?: string;
  gstNumber?: string;
  legalBusinessName?: string;
  registeredAddress?: string;
  imageUrl?: string;
}

export interface UpdateRestaurantInput extends Partial<CreateRestaurantInput> {
  isActive?: boolean;
}

export interface CreateCategoryInput {
  restaurantId: string;
  name: string;
}

export interface UpdateCategoryInput {
  name?: string;
}

export interface CreateMenuItemInput {
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  portionSize?: string;
  price: number;
  imageUrl?: string;
  available?: boolean;
}

export interface UpdateMenuItemInput extends Partial<CreateMenuItemInput> {}

export interface AddToCartInput {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderInput {
  deliveryAddress: string;
  customerName?: string;
  customerPhone?: string;
  promoCode?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

export interface UpdateDeliveryDistanceInput {
  distance: number;
}

export interface CreatePromoCodeInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
}

export interface ValidatePromoCodeInput {
  code: string;
  orderAmount: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  details?: string;
}