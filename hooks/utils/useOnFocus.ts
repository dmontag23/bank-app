import {useCallback, useEffect, useState} from "react";
import {useFocusEffect} from "@react-navigation/native";

const useOnFocus = (callback: () => void) => {
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  // sets the above state to true whenever the screen this hook
  // is used in is focused, and false when it is not focused
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, [])
  );

  // call callback when the screen is focused
  useEffect(() => {
    if (isScreenFocused) callback();
  }, [isScreenFocused, callback]);
};

export default useOnFocus;
