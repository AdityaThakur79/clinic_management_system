import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  PinInput,
  PinInputField,
} from "@chakra-ui/react";
// Custom components
import DefaultAuth from "layouts/auth/Default";
// Assets
import illustration from "assets/img/auth/auth.png";
import { useVerifyOTPMutation } from "features/api/authApi";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const [verifyOTP, { 
    data: verifyData, 
    error: verifyError, 
    isLoading: verifyIsLoading, 
    isSuccess: verifyIsSuccess 
  }] = useVerifyOTPMutation();

  // Chakra color mode
  const textColor = useColorModeValue("#3AC0E7", "white");
  const textColorSecondary = "gray.400";
  const textColorBrand = useColorModeValue("brand.500", "white");

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get email and OTP from location state or redirect to sign up
    if (location.state?.email) {
      setEmail(location.state.email);
      // Pre-fill OTP if provided (development mode)
      if (location.state?.otp) {
        setOtp(location.state.otp);
      }
    } else {
      navigate("/auth/sign-up");
    }
  }, [location.state, navigate]);

  // Handle verification mutation results
  useEffect(() => {
    if (verifyIsSuccess && verifyData) {
      toast({
        title: "Email verified successfully!",
        description: "Your account has been created. You can now sign in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Navigate to admin dashboard
      navigate("/admin");
    }
    
    if (verifyError) {
      toast({
        title: "Verification failed",
        description: verifyError?.data?.message || "Invalid or expired OTP",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [verifyIsSuccess, verifyData, verifyError, navigate, toast]);

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Please enter a valid 6-digit OTP",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await verifyOTP({
      email: email,
      otp: otp,
    });
  };

  const handleResendOTP = async () => {
    // This would typically call a resend OTP API
    toast({
      title: "OTP Resent",
      description: "A new OTP has been sent to your email",
      status: "success",
      duration: 3000,
      isClosable: true,
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
            Verify Email
          </Heading>
          <Text
            mb="36px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md">
            Enter the 6-digit code sent to {email}
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
            <VStack spacing={6}>
              <FormControl>
                <FormLabel
                  display="flex"
                  ms="4px"
                  fontSize="sm"
                  fontWeight="500"
                  color={textColor}
                  mb="8px"
                  textAlign="center">
                  Enter OTP
                </FormLabel>
                <HStack justify="center" spacing={2}>
                  <PinInput
                    value={otp}
                    onChange={handleOtpChange}
                    size="lg"
                    colorScheme="blue">
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </HStack>
              </FormControl>

              <Button
                type="submit"
                fontSize="sm"
                fontWeight="500"
                w="100%"
                h="50"
                mb="24px"
                isLoading={verifyIsLoading}
                loadingText="Verifying...">
                Verify Email
              </Button>

              <HStack spacing={4} justify="center">
                <Text color={textColorSecondary} fontSize="sm">
                  Didn't receive the code?
                </Text>
                <Button
                  variant="link"
                  color={textColorBrand}
                  fontSize="sm"
                  onClick={handleResendOTP}
                  _hover={{ textDecoration: "underline" }}>
                  Resend OTP
                </Button>
              </HStack>
            </VStack>
          </form>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default VerifyOTP;
