export type ApiSuccess<T> = {
    success: true;
    post?: T;
};

export type ApiError = {
    success: false;
    error: string;
    validationErrors?: {
        path: (string | number)[];
        message: string;
    }[];
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

