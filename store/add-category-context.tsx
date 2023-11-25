import React, {createContext, useState} from "react";

const AddCategoryContext = createContext<{
  isVisible: boolean;
  showModal: () => void;
  hideModal: () => void;
}>({
  isVisible: false,
  showModal: () => {},
  hideModal: () => {}
});

type AddCategoryContextProviderProps = {
  children: React.ReactNode;
};

export const AddCategoryContextProvider = ({
  children
}: AddCategoryContextProviderProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => setIsModalVisible(true);
  const hideModal = () => setIsModalVisible(false);

  return (
    <AddCategoryContext.Provider
      value={{isVisible: isModalVisible, showModal, hideModal}}>
      {children}
    </AddCategoryContext.Provider>
  );
};

export default AddCategoryContext;
