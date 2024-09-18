// utils/sizes.ts

import { scale, verticalScale } from '@/utils/scaling';

export const sizes = {
    imageXSWidth: scale(60), // XSmall image size
    imageXSHeight: verticalScale(60), // XSmall image size
    imageSmall: scale(90), // Small image size
    imageMediumWidth: scale(110), // Medium image size
    imageMediumHeight: verticalScale(110), // Medium image size
    imageLargeHeight: verticalScale(150), // Large image size
    imageXLargeWidth: scale(200), // XLarge image size
    imageXLargeHeight: verticalScale(250), // XLarge image size
    imageXXLHeight: verticalScale(400), // XLarge image size
    containerWidth: scale(300), // Standard container width
    containerHeight: verticalScale(200), // Standard container height
    textShadowRadius: scale(10),
    dayTile: scale(42),
    dayTileHeight: verticalScale(42),
};
