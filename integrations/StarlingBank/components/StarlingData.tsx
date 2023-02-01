import React from "react";
import {Text} from "react-native";

import useFetch from "../../../hooks/useFetch";
import {BASE_URL} from "../constants";

const StarlingData = () => {
  const data = useFetch(`${BASE_URL}/accounts`);
  return <Text>{JSON.stringify(data)}</Text>;
};

export default StarlingData;
