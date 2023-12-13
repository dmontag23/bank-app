import {useContext} from "react";
import {useQuery} from "@tanstack/react-query";

import {starlingApi} from "../../../api/axiosConfig";
import ErrorContext from "../../../store/error-context";
import {IntegrationErrorResponse} from "../../../types/errors";
import {StarlingAccount} from "../../../types/starling/accounts";

const getAccounts = async () => {
  const accountsObject = await starlingApi.get<{accounts: StarlingAccount[]}>(
    "v2/accounts"
  );
  return accountsObject.accounts;
};

const useGetStarlingAccounts = () => {
  const {addError, removeError} = useContext(ErrorContext);

  return useQuery<StarlingAccount[], IntegrationErrorResponse>({
    queryKey: ["starlingAccounts"],
    queryFn: getAccounts,
    onError: error => addError({...error, id: "useGetStarlingAccounts"}),
    onSuccess: () => removeError("useGetStarlingAccounts")
  });
};

export default useGetStarlingAccounts;
