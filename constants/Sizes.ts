// constants/Sizes.ts

import { scale, moderateScale, verticalScale } from '@/utils/scaling';

export const Sizes = {
    imageXSWidth: scale(60), // XSmall image size
    imageXSHeight: verticalScale(60), // XSmall image size
    imageSM: scale(90), // Small image size
    imageMDWidth: scale(110), // Medium image size
    imageMDHeight: verticalScale(110), // Medium image size
    imageLGHeight: verticalScale(150), // Large image size
    imageXLHeight: verticalScale(200), // XL image size
    imageXXLWidth: scale(200), // XXL image size
    imageXXLHeight: verticalScale(250), // XLarge image size
    containerWidth: scale(300), // Standard container width
    containerHeight: verticalScale(200), // Standard container height
    textShadowRadius: scale(10),
    dayTile: scale(42),
    dayTileHeight: verticalScale(42),
    bottomSpaceLarge: verticalScale(120),
    bottomSpaceMedium: verticalScale(90),
    iconSizeDefault: moderateScale(18),
    iconSizeSM: moderateScale(16),
    iconSizeMD: moderateScale(22),
    iconSizeLG: moderateScale(30),
    iconSizeXL: moderateScale(40),
    iconButtonSM: moderateScale(30),
    iconButtonMD: moderateScale(40),
    iconButtonLG: moderateScale(60),
    fontSizeDefault: moderateScale(14),
};
