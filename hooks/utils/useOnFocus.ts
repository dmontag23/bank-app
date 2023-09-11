import {useEffect, useState} from "react";
import {useFocusEffect} from "@react-navigation/native";

// TODO: This hook re-fetches the data when initially mounted
// It would be nice to eliminate this extra call but finding a
// way to do so seems non-trivial
const useOnFocus = (callback = () => {}) => {
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  // sets the above state to true whenever the screen this hook
  // is used in is focused, and false when it is not focused
  useFocusEffect(() => {
    setIsScreenFocused(true);
    return () => setIsScreenFocused(false);
  });

  // call callback when the screen is focused
  useEffect(() => {
    if (isScreenFocused) callback();
  }, [isScreenFocused, callback]);
};

export default useOnFocus;