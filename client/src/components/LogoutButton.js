import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, useToast } from '@chakra-ui/react';
import { logoutUser } from '../features/auth/authThunks';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast({
        title: "Logged out successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/auth/sign-in");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Button
      colorScheme="red"
      variant="outline"
      size="sm"
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
