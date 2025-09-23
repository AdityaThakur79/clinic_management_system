import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Heading,
  Spinner,
  useToast,
  Avatar,
  Text,
  VStack,
  HStack,
  Divider,
  Badge,
  Card,
  CardBody,
  Textarea,
  SimpleGrid,
  Image,
  Icon,
  useColorModeValue,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  useUpdateUserMutation, 
  useLoadUserQuery,
  useForgotPasswordMutation,
  useVerifyPasswordResetOTPMutation,
  useResetPasswordMutation,
  useChangePasswordMutation
} from 'features/api/authApi';
import { userLoggedIn } from 'features/auth/authSlice';
import { 
  MdEmail, 
  MdPhone, 
  MdLocationOn, 
  MdWork, 
  MdSchool, 
  MdAccessTime,
  MdLanguage,
  MdEdit,
  MdSave,
  MdCancel,
  MdAdd,
  MdDelete,
  MdImage,
  MdStar,
  MdAttachMoney,
  MdBusiness,
  MdPerson,
  MdLocalHospital,
  MdLock,
  MdSecurity,
  MdRefresh
} from 'react-icons/md';

export default function Profile() {
  const dispatch = useDispatch();
  const toast = useToast();
  const user = useSelector((s) => s.auth.user);
  const { data, isLoading } = useLoadUserQuery();
  const [updateUser, { isLoading: saving }] = useUpdateUserMutation();
  // Branch update for branchAdmin
  const [updateBranch] = require('features/api/branchApi').useUpdateBranchMutation();
  const [getBranchById] = require('features/api/branchApi').useGetBranchByIdMutation();
  const [forgotPassword, { isLoading: forgotPasswordLoading }] = useForgotPasswordMutation();
  const [verifyPasswordResetOTP, { isLoading: verifyOTPLoading }] = useVerifyPasswordResetOTPMutation();
  const [resetPassword, { isLoading: resetPasswordLoading }] = useResetPasswordMutation();
  const [changePassword, { isLoading: changePasswordLoading }] = useChangePasswordMutation();

  const [form, setForm] = useState({
    // Basic Info
    email: '',
    fullName: '',
    role: '',
    status: 'active',
    phone: '',
    address: '',
    
    // Doctor specific fields
    specialization: '',
    degree: '',
    yearsOfExperience: 0,
    consultationTime: 30,
    perSessionCharge: 0,
    bio: '',
    languages: [],
    availableDays: [],
    availableTimeSlots: {},
    
    // Branch Admin specific fields
    branch: '',
    branchName: '',
    branchAddress: '',
    branchPhone: '',
    branchEmail: '',
    
    // Profile image
    image: '',
    bannerUrl: '',
  });

  const [focusedField, setFocusedField] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');
  const [newAvailableDay, setNewAvailableDay] = useState('');

  // Password-related states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    email: '',
    otp: '',
    newPasswordReset: '',
    confirmPasswordReset: ''
  });
  const [passwordStep, setPasswordStep] = useState('change'); // 'change', 'forgot', 'verify', 'reset'
  const [otpSent, setOtpSent] = useState(false);

  // Prefer API user payload if available; fallback to Redux user
  const apiUser = data?.user;
  const currentUser = apiUser || user;
  const isDoctor = currentUser?.role === 'doctor';
  const isBranchAdmin = currentUser?.role === 'branchAdmin';
  const isSuperAdmin = currentUser?.role === 'superAdmin';

  // Prefill form with current user data
  useEffect(() => {
    if (currentUser) {
      setForm({
        email: currentUser.email || '',
        fullName: currentUser.fullName || currentUser.name || '',
        role: currentUser.role || '',
        status: typeof currentUser.status === 'boolean'
          ? (currentUser.status ? 'active' : 'inactive')
          : (currentUser.status || 'active'),
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        specialization: currentUser.specialization || '',
        degree: currentUser.degree || '',
        yearsOfExperience: currentUser.yearsOfExperience || 0,
        consultationTime: currentUser.consultationTime || 30,
        perSessionCharge: currentUser.perSessionCharge || 0,
        bio: currentUser.bio || '',
        languages: currentUser.languages || [],
        availableDays: currentUser.availableDays || [],
        availableTimeSlots: currentUser.availableTimeSlots || {},
        branch: currentUser.branch || '',
        branchName: currentUser.branchName || '',
        branchAddress: currentUser.branchAddress || '',
        branchPhone: currentUser.branchPhone || '',
        branchEmail: currentUser.branchEmail || '',
        gst: '',
        pan: '',
        scn: '',
        image: currentUser.photoUrl || currentUser.image || '',
        bannerUrl: currentUser.bannerUrl || '',
      });
    }
  }, [currentUser]);

  // Fetch branch details for branch admin to prefill editable fields
  useEffect(() => {
    const branchId = currentUser?.branch?._id || currentUser?.branch;
    if (isBranchAdmin && branchId) {
      (async () => {
        try {
          const res = await getBranchById({ id: branchId }).unwrap();
          const b = res?.branch;
          if (b) {
            setForm((prev) => ({
              ...prev,
              branchName: b.branchName || prev.branchName,
              branchAddress: b.address || prev.branchAddress,
              branchPhone: b.phone || prev.branchPhone,
              branchEmail: b.email || prev.branchEmail,
              gst: b.gst || prev.gst || '',
              pan: b.pan || prev.pan || '',
              scn: b.scn || prev.scn || '',
            }));
          }
        } catch (e) {
          // non-blocking
        }
      })();
    }
  }, [isBranchAdmin, currentUser, getBranchById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleNumberChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original data
    if (currentUser) {
      setForm({
        email: currentUser.email || '',
        fullName: currentUser.fullName || currentUser.name || '',
        role: currentUser.role || '',
        status: currentUser.status || 'active',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        specialization: currentUser.specialization || '',
        degree: currentUser.degree || '',
        yearsOfExperience: currentUser.yearsOfExperience || 0,
        consultationTime: currentUser.consultationTime || 30,
        perSessionCharge: currentUser.perSessionCharge || 0,
        bio: currentUser.bio || '',
        languages: currentUser.languages || [],
        availableDays: currentUser.availableDays || [],
        availableTimeSlots: currentUser.availableTimeSlots || {},
        branch: currentUser.branch || '',
        branchName: currentUser.branchName || '',
        branchAddress: currentUser.branchAddress || '',
        branchPhone: currentUser.branchPhone || '',
        branchEmail: currentUser.branchEmail || '',
        image: currentUser.image || '',
      });
    }
  };

  const handleSave = async () => {
    try {
      // Allow only user-related fields to be updated (exclude any branch-related fields)
      const statusBool = typeof form.status === 'string'
        ? form.status.toLowerCase() === 'active'
        : !!form.status;

      // Clean slots: drop _id, normalize keys
      const cleanedSlots = Object.fromEntries(
        Object.entries(form.availableTimeSlots || {}).map(([day, rng]) => [
          (day || '').toLowerCase(),
          rng ? { start: rng.start, end: rng.end } : { start: '', end: '' },
        ])
      );

      const basePayload = {
        email: form.email,
        // Many backends expect `name`; send both for compatibility
        name: form.fullName,
        fullName: form.fullName,
        status: statusBool,
        phone: form.phone,
        address: form.address,
        bio: form.bio,
        languages: form.languages,
      };

      let payload = { ...basePayload };

      // If doctor, include doctor-required fields and validate before sending
      if (isDoctor) {
        const missing = [];
        if (!form.specialization) missing.push('Specialization');
        if (!form.degree) missing.push('Degree');
        if (form.yearsOfExperience === undefined || form.yearsOfExperience === null) missing.push('Years of Experience');
        if (form.perSessionCharge === undefined || form.perSessionCharge === null) missing.push('Per Session Charge');

        if (missing.length) {
          toast({
            title: 'Please fill required fields',
            description: missing.join(', '),
            status: 'error',
            duration: 4000,
          });
          return;
        }

        payload = {
          ...payload,
          specialization: form.specialization,
          degree: form.degree,
          yearsOfExperience: Number(form.yearsOfExperience) || 0,
          consultationTime: Number(form.consultationTime) || 30,
          perSessionCharge: Number(form.perSessionCharge) || 0,
          availableDays: Array.isArray(form.availableDays) ? form.availableDays : [],
          availableTimeSlots: cleanedSlots,
        };

        // Backend may require branch for doctor; include existing branch id (read-only)
        if (currentUser?.branch) {
          payload.branch = currentUser.branch;
        }
      }

      const res = await updateUser(payload).unwrap();

      // If branchAdmin, allow updating branch info from the same form when fields present
      if (isBranchAdmin && (form.branchName || form.branchAddress || form.branchPhone || form.branchEmail || form.gst || form.pan || form.scn)) {
        try {
          await updateBranch({
            // Backend resolves branchId from token for branchAdmin
            branchName: form.branchName,
            address: form.branchAddress,
            phone: form.branchPhone,
            email: form.branchEmail,
            gst: form.gst,
            pan: form.pan,
            scn: form.scn,
          }).unwrap();
        } catch (e) {
          // Non-blocking
          console.warn('Branch update failed', e);
        }
      }
      dispatch(userLoggedIn({ user: res }));
      toast({ 
        title: 'Profile updated successfully', 
        status: 'success', 
        duration: 3000 
      });
      setIsEditing(false);
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !form.languages.includes(newLanguage.trim())) {
      setForm({
        ...form,
        languages: [...form.languages, newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language) => {
    setForm({
      ...form,
      languages: form.languages.filter(lang => lang !== language)
    });
  };

  const addAvailableDay = () => {
    const key = (newAvailableDay || '').toLowerCase();
    if (key && !form.availableDays.includes(key)) {
      setForm({
        ...form,
        availableDays: [...form.availableDays, key],
        availableTimeSlots: {
          ...(form.availableTimeSlots || {}),
          [key]: form.availableTimeSlots?.[key] || { start: '09:00', end: '17:00' },
        },
      });
      setNewAvailableDay('');
    }
  };

  const removeAvailableDay = (day) => {
    setForm({
      ...form,
      availableDays: form.availableDays.filter(d => d !== day)
    });
  };

  const handleSlotChange = (day, field, value) => {
    const key = (day || '').toLowerCase();
    setForm(prev => ({
      ...prev,
      availableTimeSlots: {
        ...(prev.availableTimeSlots || {}),
        [key]: {
          ...(prev.availableTimeSlots?.[key] || {}),
          [field]: value,
        },
      },
    }));
  };

  // Password handling functions
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handleChangePassword = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast({
          title: 'Passwords do not match',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        toast({
          title: 'Password too short',
          description: 'Password must be at least 6 characters long',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();

      toast({
        title: 'Password changed successfully',
        status: 'success',
        duration: 3000,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        email: '',
        otp: '',
        newPasswordReset: '',
        confirmPasswordReset: ''
      });
      setShowPasswordSection(false);
    } catch (err) {
      toast({
        title: 'Failed to change password',
        description: err?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!passwordForm.email) {
        toast({
          title: 'Email is required',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      await forgotPassword(passwordForm.email).unwrap();
      setOtpSent(true);
      setPasswordStep('verify');
      toast({
        title: 'OTP sent to your email',
        description: 'Please check your email for the password reset OTP',
        status: 'success',
        duration: 5000,
      });
    } catch (err) {
      toast({
        title: 'Failed to send OTP',
        description: err?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (!passwordForm.otp) {
        toast({
          title: 'OTP is required',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      await verifyPasswordResetOTP({
        email: passwordForm.email,
        otp: passwordForm.otp,
      }).unwrap();

      setPasswordStep('reset');
      toast({
        title: 'OTP verified successfully',
        description: 'You can now set your new password',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Invalid OTP',
        description: err?.data?.message || 'Please check your OTP and try again',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleResetPassword = async () => {
    try {
      if (passwordForm.newPasswordReset !== passwordForm.confirmPasswordReset) {
        toast({
          title: 'Passwords do not match',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      if (passwordForm.newPasswordReset.length < 6) {
        toast({
          title: 'Password too short',
          description: 'Password must be at least 6 characters long',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      await resetPassword({
        email: passwordForm.email,
        otp: passwordForm.otp,
        newPassword: passwordForm.newPasswordReset,
      }).unwrap();

      toast({
        title: 'Password reset successfully',
        description: 'You can now login with your new password',
        status: 'success',
        duration: 5000,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        email: '',
        otp: '',
        newPasswordReset: '',
        confirmPasswordReset: ''
      });
      setPasswordStep('change');
      setShowPasswordSection(false);
      setOtpSent(false);
    } catch (err) {
      toast({
        title: 'Failed to reset password',
        description: err?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const resetPasswordFlow = () => {
    setPasswordStep('forgot');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      email: currentUser?.email || '',
      otp: '',
      newPasswordReset: '',
      confirmPasswordReset: ''
    });
    setOtpSent(false);
  };

  const getRoleIcon = () => {
    if (isDoctor) return <Icon as={MdLocalHospital} />;
    if (isBranchAdmin) return <Icon as={MdBusiness} />;
    return <Icon as={MdPerson} />;
  };

  const getRoleColor = () => {
    if (isDoctor) return 'purple';
    if (isBranchAdmin) return 'blue';
    return 'green';
  };

  // Helpers
  const capitalize = (str) =>
    typeof str === 'string' && str.length > 0
      ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
      : '';

  const brandHover = { bg: '#2BA8D1', color: 'white', transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(43, 168, 209, 0.3)' };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '100px', xl: '100px' }} px={6} maxW="1200px" mx="auto">
      {/* Header Section with optional banner */}
      <Card mb={6} boxShadow="lg">
        <CardBody>
          {form.bannerUrl && (
            <Box
              bg={`url(${form.bannerUrl})`}
              bgSize='cover'
              borderRadius='16px'
              h='120px'
              w='100%'
              mb='16px'
            />
          )}
          <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
            {/* Avatar Section */}
            <Box position="relative">
              <Avatar
                name={form.fullName}
                src={form.image}
                size="2xl"
                bg="blue.500"
                color="white"
                border="4px solid"
                borderColor="white"
                boxShadow="lg"
              />
              <Badge
                position="absolute"
                bottom="-5px"
                right="-5px"
                bg={form.status === 'active' ? 'brand.500' : 'gray.400'}
                color="white"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                textTransform="capitalize"
                boxShadow="0 0 0 2px white"
              >
                {form.status}
              </Badge>
            </Box>

            {/* User Info */}
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={3} flex={1}>
              <HStack spacing={3}>
                <Heading size="xl" color="gray.800">
                  {form.fullName || 'User Name'}
                </Heading>
                <Badge
                  colorScheme={getRoleColor()}
                  px={3}
                  py={1}
                  borderRadius="full"
                  textTransform="capitalize"
                  fontSize="sm"
                  leftIcon={getRoleIcon()}
                >
                  {form.role}
                </Badge>
              </HStack>
              
              <Text color="gray.600" fontSize="lg">
                {form.email}
              </Text>
              
              {isDoctor && form.specialization && (
                <Text color="purple.600" fontWeight="semibold">
                  {form.specialization}
                </Text>
              )}
              
              {isBranchAdmin && form.branchName && (
                <Text color="blue.600" fontWeight="semibold">
                  {form.branchName}
                </Text>
              )}
            </VStack>

            {/* Action Buttons */}
            <HStack spacing={3}>
              {isEditing ? (
                <>
                  <Button
                    bg="brand.500"
                    _hover={{ bg: 'brand.400' }}
                    leftIcon={<Icon as={MdSave} />}
                    onClick={handleSave}
                    isLoading={saving}
                    loadingText="Saving..."
                    color={"#ffffff"}
                  >
                    Save Changes
                  </Button>
                  <Button
                    colorScheme="gray"
                    leftIcon={<Icon as={MdCancel} />}
                    onClick={handleCancel}
                    _hover={brandHover}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  bg="brand.500"
                  _hover={{ bg: 'brand.400' }}
                  leftIcon={<Icon as={MdEdit} />}
                  onClick={handleEdit}
                  color={"#ffffff"}
                >
                  Edit Profile
                </Button>
              )}
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      {/* Form Sections */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Basic Information */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="brand.500">
              Basic Information
            </Heading>
            <Divider mb={6} />
            
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  isReadOnly={!isEditing}
                  placeholder="Enter full name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  isReadOnly={!isEditing}
                  placeholder="Enter email address"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  isReadOnly={!isEditing}
                  placeholder="Enter phone number"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Address</FormLabel>
                <Textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  isReadOnly={!isEditing}
                  placeholder="Enter address"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Account Status</FormLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  isDisabled={!isEditing}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Role-specific Information */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="brand.500">
              {isDoctor ? 'Professional Information' : isBranchAdmin ? 'Branch Information' : 'Admin Information'}
            </Heading>
            <Divider mb={6} />

            {isDoctor && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Specialization</FormLabel>
                  <Input
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    isReadOnly={!isEditing}
                    placeholder="e.g., Cardiologist, Neurologist"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Degree</FormLabel>
                  <Input
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                    isReadOnly={!isEditing}
                    placeholder="e.g., MBBS, MD"
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Years of Experience</FormLabel>
                    <NumberInput
                      value={form.yearsOfExperience}
                      onChange={(value) => handleNumberChange('yearsOfExperience', value)}
                      isReadOnly={!isEditing}
                      min={0}
                      max={50}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Consultation Time (min)</FormLabel>
                    <NumberInput
                      value={form.consultationTime}
                      onChange={(value) => handleNumberChange('consultationTime', value)}
                      isReadOnly={!isEditing}
                      min={15}
                      max={120}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Per Session Charge (₹)</FormLabel>
                  <NumberInput
                    value={form.perSessionCharge}
                    onChange={(value) => handleNumberChange('perSessionCharge', value)}
                    isReadOnly={!isEditing}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    isReadOnly={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </FormControl>
              </VStack>
            )}

            {isBranchAdmin && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Branch Name</FormLabel>
                  <Input
                    name="branchName"
                    value={form.branchName}
                    onChange={handleChange}
                    isReadOnly={!isEditing}
                    placeholder="Enter branch name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Branch Address</FormLabel>
                  <Textarea
                    name="branchAddress"
                    value={form.branchAddress}
                    onChange={handleChange}
                    isReadOnly={!isEditing}
                    placeholder="Enter branch address"
                    rows={3}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Branch Phone</FormLabel>
                    <Input
                      name="branchPhone"
                      value={form.branchPhone}
                      onChange={handleChange}
                      isReadOnly={!isEditing}
                      placeholder="Enter branch phone"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Branch Email</FormLabel>
                    <Input
                      type="email"
                      name="branchEmail"
                      value={form.branchEmail}
                      onChange={handleChange}
                      isReadOnly={!isEditing}
                      placeholder="Enter branch email"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>GST</FormLabel>
                    <Input
                      name="gst"
                      value={form.gst}
                      onChange={handleChange}
                      isReadOnly={!isEditing}
                      placeholder="GST number"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>PAN</FormLabel>
                    <Input
                      name="pan"
                      value={form.pan}
                      onChange={handleChange}
                      isReadOnly={!isEditing}
                      placeholder="PAN number"
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>SCN</FormLabel>
                  <Input
                    name="scn"
                    value={form.scn}
                    onChange={handleChange}
                    isReadOnly={!isEditing}
                    placeholder="SCN"
                  />
                </FormControl>
              </VStack>
            )}

            {isSuperAdmin && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Super Admin Access!</AlertTitle>
                  <AlertDescription>
                    You have full access to all system features and can manage all branches, doctors, and admins.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </CardBody>
        </Card>

        {/* Doctor-specific additional sections */}
        {isDoctor && (
          <>
            {/* Languages */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4} color="gray.700">
                  Languages Spoken
                </Heading>
                <Divider mb={6} />
                
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add a language"
                      isDisabled={!isEditing}
                    />
                    <Button
                      bg="brand.500"
                      _hover={{ bg: 'brand.400' }}
                      onClick={addLanguage}
                      isDisabled={!isEditing || !newLanguage.trim()}
                      leftIcon={<Icon as={MdAdd} />}
                    >
                      Add
                    </Button>
                  </HStack>
                  
                  <HStack spacing={2} flexWrap="wrap">
                    {form.languages.map((language, index) => (
                      <Tag key={index} bg="brand.100" color="#ffffff" borderRadius="full">
                        <TagLabel>{language}</TagLabel>
                        {isEditing && (
                          <TagCloseButton onClick={() => removeLanguage(language)} />
                        )}
                      </Tag>
                    ))}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Available Days & Slots */}
            <Card>
              <CardBody>
                <Heading size="md" mb={2} color="gray.700">
                  Available Days
                </Heading>
                <Divider mb={4} />
                
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Select
                      value={newAvailableDay}
                      onChange={(e) => setNewAvailableDay(e.target.value)}
                      placeholder="Select a day"
                      isDisabled={!isEditing}
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </Select>
                    <Button
                      bg="brand.500"
                      _hover={{ bg: 'brand.400' }}
                      onClick={addAvailableDay}
                      isDisabled={!isEditing || !newAvailableDay}
                      leftIcon={<Icon as={MdAdd} />}
                    >
                      Add
                    </Button>
                  </HStack>
                  
                  {/* Render days with time ranges when present */}
                  <VStack spacing={3} align="start">
                    {form.availableDays.length === 0 && (
                      <Text color="gray.500" fontSize="sm">No available days configured.</Text>
                    )}
                    {form.availableDays.map((day, index) => {
                      const slot = form.availableTimeSlots?.[day] || form.availableTimeSlots?.[day.toLowerCase()];
                      const label = capitalize(day);
                      return (
                        <HStack key={index} spacing={3} wrap="wrap" align="center">
                          <Tag bg="brand.100" color="#ffffff" borderRadius="full">
                            <TagLabel>{label}</TagLabel>
                            {isEditing && <TagCloseButton onClick={() => removeAvailableDay(day)} />}
                          </Tag>
                          {isEditing ? (
                            <HStack spacing={2}>
                              <Input
                                type="time"
                                value={slot?.start || ''}
                                onChange={(e) => handleSlotChange(day, 'start', e.target.value)}
                                size="sm"
                                w="120px"
                              />
                              <Text color="gray.500">to</Text>
                              <Input
                                type="time"
                                value={slot?.end || ''}
                                onChange={(e) => handleSlotChange(day, 'end', e.target.value)}
                                size="sm"
                                w="120px"
                              />
                            </HStack>
                          ) : (
                            slot?.start && slot?.end ? (
                              <Tag colorScheme="gray" variant="subtle">
                                <TagLabel>{`${slot.start} - ${slot.end}`}</TagLabel>
                              </Tag>
                            ) : (
                              <Text color="gray.500" fontSize="sm">No time window set</Text>
                            )
                          )}
                        </HStack>
                      );
                    })}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </>
        )}

        {/* Password Management Section */}
        <Card gridColumn={{ base: '1', lg: '1 / -1' }}>
          <CardBody>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md" color="brand.500" leftIcon={<Icon as={MdSecurity} />}>
                Password Management
              </Heading>
              <Button
                variant="outline"
                leftIcon={<Icon as={MdLock} />}
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                colorScheme="blue"
                _hover={brandHover}
              >
                {showPasswordSection ? 'Hide' : 'Change Password'}
              </Button>
            </Flex>
            <Divider mb={6} />

            {showPasswordSection && (
              <VStack spacing={6} align="stretch">
                {/* Password Step Navigation */}
                <HStack spacing={4} justify="center">
                  <Button
                    size="sm"
                    variant={passwordStep === 'change' ? 'solid' : 'outline'}
                    colorScheme="blue"
                    onClick={() => setPasswordStep('change')}
                    _hover={passwordStep === 'change' ? undefined : brandHover}
                  >
                    Change Password
                  </Button>
                  <Button
                    size="sm"
                    variant={passwordStep === 'forgot' ? 'solid' : 'outline'}
                    colorScheme="orange"
                    onClick={resetPasswordFlow}
                    leftIcon={<Icon as={MdRefresh} />}
                    _hover={passwordStep === 'forgot' ? undefined : brandHover}
                  >
                    Forgot Password
                  </Button>
                </HStack>

                {/* Change Password Form */}
                {passwordStep === 'change' && (
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription>
                        Change your current password. You'll need to enter your current password for security.
                      </AlertDescription>
                    </Alert>

                    <FormControl>
                      <FormLabel>Current Password</FormLabel>
                      <Input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>New Password</FormLabel>
                      <Input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Confirm New Password</FormLabel>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                      />
                    </FormControl>

                    <HStack spacing={3}>
                      <Button
                        bg="brand.500"
                        _hover={{ bg: 'brand.400' }}
                        onClick={handleChangePassword}
                        isLoading={changePasswordLoading}
                        loadingText="Changing..."
                        leftIcon={<Icon as={MdSave} />}
                        color="white"
                      >
                        Change Password
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordSection(false)}
                        _hover={brandHover}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  </VStack>
                )}

                {/* Forgot Password Form */}
                {passwordStep === 'forgot' && (
                  <VStack spacing={4} align="stretch">
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription>
                        Enter your email address to receive a password reset OTP.
                      </AlertDescription>
                    </Alert>

                    <FormControl>
                      <FormLabel>Email Address</FormLabel>
                      <Input
                        type="email"
                        name="email"
                        value={passwordForm.email}
                        onChange={handlePasswordChange}
                        placeholder="Enter your email address"
                      />
                    </FormControl>

                    <Button
                      bg="orange.500"
                      _hover={{ bg: 'orange.400' }}
                      onClick={handleForgotPassword}
                      isLoading={forgotPasswordLoading}
                      loadingText="Sending OTP..."
                      leftIcon={<Icon as={MdEmail} />}
                      color="white"
                    >
                      Send Reset OTP
                    </Button>
                  </VStack>
                )}

                {/* Verify OTP Form */}
                {passwordStep === 'verify' && (
                  <VStack spacing={4} align="stretch">
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription>
                        OTP sent to {passwordForm.email}. Please check your email and enter the OTP below.
                      </AlertDescription>
                    </Alert>

                    <FormControl>
                      <FormLabel>Enter OTP</FormLabel>
                      <Input
                        type="text"
                        name="otp"
                        value={passwordForm.otp}
                        onChange={handlePasswordChange}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        textAlign="center"
                        fontSize="lg"
                        letterSpacing="2px"
                      />
                    </FormControl>

                    <HStack spacing={3}>
                      <Button
                        bg="green.500"
                        _hover={{ bg: 'green.400' }}
                        onClick={handleVerifyOTP}
                        isLoading={verifyOTPLoading}
                        loadingText="Verifying..."
                        leftIcon={<Icon as={MdSecurity} />}
                        color="white"
                      >
                        Verify OTP
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPasswordStep('forgot')}
                        _hover={brandHover}
                      >
                        Back
                      </Button>
                    </HStack>
                  </VStack>
                )}

                {/* Reset Password Form */}
                {passwordStep === 'reset' && (
                  <VStack spacing={4} align="stretch">
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription>
                        OTP verified successfully! You can now set your new password.
                      </AlertDescription>
                    </Alert>

                    <FormControl>
                      <FormLabel>New Password</FormLabel>
                      <Input
                        type="password"
                        name="newPasswordReset"
                        value={passwordForm.newPasswordReset}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Confirm New Password</FormLabel>
                      <Input
                        type="password"
                        name="confirmPasswordReset"
                        value={passwordForm.confirmPasswordReset}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                      />
                    </FormControl>

                    <HStack spacing={3}>
                      <Button
                        bg="green.500"
                        _hover={{ bg: 'green.400' }}
                        onClick={handleResetPassword}
                        isLoading={resetPasswordLoading}
                        loadingText="Resetting..."
                        leftIcon={<Icon as={MdRefresh} />}
                        color="white"
                      >
                        Reset Password
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPasswordStep('verify')}
                        _hover={brandHover}
                      >
                        Back
                      </Button>
                    </HStack>
                  </VStack>
                )}
              </VStack>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
