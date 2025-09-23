import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  useToast,
} from '@chakra-ui/react';
import DefaultAuth from 'layouts/auth/Default';
import illustration from 'assets/img/auth/auth.png';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { useForgotPasswordMutation, useResetPasswordMutation } from 'features/api/authApi';

function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();

  const textColor = useColorModeValue('#3AC0E7', 'white');
  const textColorSecondary = 'gray.400';
  const textColorBrand = useColorModeValue('brand.500', 'white');

  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  const [step, setStep] = useState('request');
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '' });

  const [forgotPassword, { isLoading: sending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast({ title: 'Please enter your email', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    try {
      await forgotPassword(formData.email).unwrap();
      toast({ title: 'OTP sent to your email', status: 'success', duration: 4000, isClosable: true });
      setStep('reset');
    } catch (err) {
      toast({ title: 'Failed to send OTP', description: err?.data?.message || 'Try again', status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.otp || !formData.newPassword) {
      toast({ title: 'Please fill in all fields', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    try {
      await resetPassword({ email: formData.email, otp: formData.otp, newPassword: formData.newPassword }).unwrap();
      toast({ title: 'Password reset successful', status: 'success', duration: 4000, isClosable: true });
      navigate('/auth/sign-in');
    } catch (err) {
      toast({ title: 'Failed to reset password', description: err?.data?.message || 'Try again', status: 'error', duration: 5000, isClosable: true });
    }
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: '100%', md: 'max-content' }}
        w='100%'
        mx={{ base: 'auto', lg: '0px' }}
        me='auto'
        h='100%'
        alignItems='start'
        justifyContent='center'
        mb={{ base: '30px', md: '60px' }}
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '14vh' }}
        flexDirection='column'
      >
        <Box me='auto'>
          <Heading color={textColor} fontSize='28px' mb='10px'>
            {step === 'request' ? 'Forgot Password' : 'Reset Password'}
          </Heading>
          <Text mb='36px' ms='4px' color={textColorSecondary} fontWeight='400' fontSize='md'>
            {step === 'request'
              ? 'Enter your email to receive an OTP to reset your password.'
              : 'Enter the OTP sent to your email and set a new password.'}
          </Text>
        </Box>

        <Flex
          zIndex='2'
          direction='column'
          w={{ base: '100%', md: '420px' }}
          maxW='100%'
          background='transparent'
          borderRadius='15px'
          mx={{ base: 'auto', lg: 'unset' }}
          me='auto'
          mb={{ base: '20px', md: 'auto' }}
        >
          {step === 'request' ? (
            <form onSubmit={handleRequestOTP}>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} mb='8px'>
                  Email<Text as='span' color={textColorBrand}>*</Text>
                </FormLabel>
                <Input
                  isRequired
                  variant='auth'
                  fontSize='sm'
                  type='email'
                  placeholder='mail@example.com'
                  mb='24px'
                  size='lg'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Button type='submit' w='100%' color='white' bg='#3AC0E7' h='50' isLoading={sending} loadingText='Sending OTP...'>
                  Send Reset OTP
                </Button>
                <NavLink to='/auth/sign-in'>
                  <Text mt='12px' color={textColorBrand} fontSize='sm'>Back to sign in</Text>
                </NavLink>
              </FormControl>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} mb='8px'>
                  Email<Text as='span' color={textColorBrand}>*</Text>
                </FormLabel>
                <Input
                  isRequired
                  variant='auth'
                  fontSize='sm'
                  type='email'
                  placeholder='mail@example.com'
                  mb='16px'
                  size='lg'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                />

                <FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} mb='8px'>
                  OTP<Text as='span' color={textColorBrand}>*</Text>
                </FormLabel>
                <Input
                  isRequired
                  variant='auth'
                  fontSize='sm'
                  type='text'
                  placeholder='Enter OTP'
                  mb='16px'
                  size='lg'
                  name='otp'
                  value={formData.otp}
                  onChange={handleInputChange}
                />

                <FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} mb='8px'>
                  New Password<Text as='span' color={textColorBrand}>*</Text>
                </FormLabel>
                <InputGroup size='md'>
                  <Input
                    isRequired
                    fontSize='sm'
                    placeholder='Min. 8 characters'
                    mb='24px'
                    size='lg'
                    type={show ? 'text' : 'password'}
                    variant='auth'
                    name='newPassword'
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                  <InputRightElement display='flex' alignItems='center' mt='4px'>
                    <Icon
                      color={textColorSecondary}
                      _hover={{ cursor: 'pointer' }}
                      as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                      onClick={handleClick}
                    />
                  </InputRightElement>
                </InputGroup>

                <Button type='submit' w='100%' color='white' bg='#3AC0E7' h='50' isLoading={resetting} loadingText='Resetting...'>
                  Reset Password
                </Button>
                <NavLink to='/auth/sign-in'>
                  <Text mt='12px' color={textColorBrand} fontSize='sm'>Back to sign in</Text>
                </NavLink>
              </FormControl>
            </form>
          )}
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default ForgotPassword;


