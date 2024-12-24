// import { useSelector } from 'react-redux';
// import { RootState } from '../store';

export function kgToPounds(weight: number): number {
  weight = weight * 2.20462;
  return parseFloat(weight.toFixed(1));
}

export function poundsToKg(weight: number): number {
  weight = weight / 2.20462;
  return parseFloat(weight.toFixed(1));
}

// to import { function1, function2} from 'path to this';

// export const getDisplayWeight = (weight: number): number => {
//   const weightPreferred = useSelector((state: RootState) => state.settings.weightPreference);

//   if (weightPreferred === 'pounds') {
//     return kgToPounds(weight);
//   }

//   return weight;
// };

// export const getBackendWeight = (weight: number): number => {
//   const weightPreferred = useSelector((state: RootState) => state.settings.weightPreference);

//   if (weightPreferred === 'pounds') {
//     return poundsToKg(weight);
//   }

//   return weight;
// };


