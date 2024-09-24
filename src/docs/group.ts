export const groupType = {
    Type1: "type1",
    Type2: "type2",
    Type3: "type3",
    TypeAll: "typeall",
  } as const;
  
  export type GroupType = keyof typeof groupType;
  
  export const groupTypeLength: Record<number, GroupType> = {
    16: "TypeAll",
    8: "Type3",
    6: "Type2",
    5: "Type2",
    4: "Type1",
  };
  