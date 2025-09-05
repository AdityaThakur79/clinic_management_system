import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useToast } from "@chakra-ui/react";
// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Select,
} from "@chakra-ui/react";
// Custom components
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";
// Assets
import illustration from "assets/img/auth/auth.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useRegisterUserMutation } from "features/api/authApi";
import { userLoggedIn } from "features/auth/authSlice";

function SignUp() {
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useDispatch();
  
  const [registerUser, { 
    data: registerData, 
    error: registerError, 
    isLoading: registerIsLoading, 
    isSuccess: registerIsSuccess 
  }] = useRegisterUserMutation();

  // Chakra color mode
  const textColor = useColorModeValue("#3AC0E7", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("#3AC0E7", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");

  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "superAdmin",
  });

  const handleClick = () => setShow(!show);
  const handleClickConfirm = () => setShowConfirm(!showConfirm);

  // Handle registration mutation results
  useEffect(() => {
    if (registerIsSuccess && registerData) {
      console.log("Registration success, data:", registerData);
      
      // Auto-login after successful registration
      if (registerData.user) {
        console.log("Dispatching userLoggedIn with user:", registerData.user);
        dispatch(userLoggedIn({ user: registerData.user }));
      }
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created and you are now logged in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Navigate directly to admin dashboard (user is auto-logged in)
      navigate("/admin/dashboard");
    }
    
    if (registerError) {
      toast({
        title: "Registration failed",
        description: registerError?.data?.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [registerIsSuccess, registerData, registerError, navigate, toast, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: "Please enter a valid email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password must be at least 8 characters long",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };


  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w="100%"
        mx={{ base: "auto", lg: "0px" }}
        me="auto"
        h="100%"
        alignItems="start"
        justifyContent="center"
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "14vh" }}
        flexDirection="column">
        <Box me="auto">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Create Account
          </Heading>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md">
            Enter your details to create your account!
          </Text>
        </Box>
        <Flex
          zIndex="2"
          direction="column"
          w={{ base: "100%", md: "420px" }}
          maxW="100%"
          background="transparent"
          borderRadius="15px"
          mx={{ base: "auto", lg: "unset" }}
          me="auto"
          mb={{ base: "20px", md: "auto" }}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px">
                  Full Name<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  type="text"
                  placeholder="Enter your full name"
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px">
                  Email<Text color={brandStars}>*</Text>
                </FormLabel>
                <Input
                  isRequired={true}
                  variant="auth"
                  fontSize="sm"
                  ms={{ base: "0px", md: "0px" }}
                  type="email"
                  placeholder="mail@example.com"
                  mb="24px"
                  fontWeight="500"
                  size="lg"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  display="flex">
                  Password<Text color={brandStars}>*</Text>
                </FormLabel>
                <InputGroup size="md">
                  <Input
                    isRequired={true}
                    fontSize="sm"
                    placeholder="Min. 8 characters"
                    mb="24px"
                    size="lg"
                    type={show ? "text" : "password"}
                    variant="auth"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <InputRightElement display="flex" alignItems="center" mt="4px">
                    <Icon
                      color={textColorSecondary}
                      _hover={{ cursor: "pointer" }}
                      as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                      onClick={handleClick}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  display="flex">
                  Confirm Password<Text color={brandStars}>*</Text>
                </FormLabel>
                <InputGroup size="md">
                  <Input
                    isRequired={true}
                    fontSize="sm"
                    placeholder="Confirm your password"
                    mb="24px"
                    size="lg"
                    type={showConfirm ? "text" : "password"}
                    variant="auth"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <InputRightElement display="flex" alignItems="center" mt="4px">
                    <Icon
                      color={textColorSecondary}
                      _hover={{ cursor: "pointer" }}
                      as={showConfirm ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                      onClick={handleClickConfirm}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
 

                              <Button
                  type="submit"
                  fontSize="sm"
                  fontWeight="500"
                  w="100%"
                  h="50"
                  mb="24px"  bg="#3AC0E7"
                  isLoading={registerIsLoading}
                  loadingText="Creating Account...">
                  Create Account
                </Button>
            </VStack>
          </form>

          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            maxW="100%"
            mt="2px">
            <Text color={textColorDetails} fontWeight="400" fontSize="14px">
              Already have an account?
              <NavLink to="/auth/sign-in">
                <Text
                  color={textColorBrand}
                  as="span"
                  ms="5px"
                  fontWeight="500">
                  Sign In
                </Text>
              </NavLink>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignUp;
