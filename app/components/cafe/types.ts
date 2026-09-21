import { descriptor } from '../../../node_modules/effect/src/internal/core-effect';
export type MenuItemData ={
    id:string;
    categoryId:string;
    name:string;
    description:string|null;
    price: number;
    feature: boolean;
};

export type CategoryData ={
    id:string;
    name:string;
    items:MenuItemData[];
};

export type ThemeData ={
    backgroundColor?:string;
    surfaceColor?:string;
    textColor?:string;
    mutedColor?:string;
    primaryColor?:string;
    accentColor?:string;
    successColor?:string;
};