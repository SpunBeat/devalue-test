/**
 * @format
 */

export type RootTabParamList = {
  Log: undefined;
  Analysis: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
