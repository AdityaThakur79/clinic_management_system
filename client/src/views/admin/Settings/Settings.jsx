import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  useToast,
  Grid,
  GridItem,
  Divider,
  Text,
  useColorModeValue,
  Switch,
  Image,
  Icon,
  Flex,
  Spinner,
  Center,
  IconButton,
  CloseButton,
  SimpleGrid,
  Badge,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton
} from '@chakra-ui/react';
import { useGetSettingsQuery, useUpdateSettingsMutation, useUpdateSpecificSettingMutation } from '../../../features/api/settingsApi';
import { useSelector } from 'react-redux';
import { MdSave, MdEdit, MdUpload, MdClose, MdSettings, MdVisibility, MdVisibilityOff, MdInfo } from 'react-icons/md';

const Settings = () => {
  const toast = useToast();
  const user = useSelector((state) => state.auth.user);
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();

  // API hooks
  const { data: settingsData, isLoading: isLoadingSettings, error: settingsError } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  const [updateSpecificSetting, { isLoading: isUpdatingSpecific }] = useUpdateSpecificSettingMutation();

  // State for form data
  const [formData, setFormData] = useState({
    websiteName: '',
    websiteDescription: '',
    contactInfo: {
      phone: '',
      email: '',
      address: '',
      website: ''
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: ''
    },
    seoSettings: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    },
    analyticsSettings: {
      googleAnalyticsId: '',
      facebookPixelId: ''
    }
  });

  // State for display settings
  const [displaySettings, setDisplaySettings] = useState({
    showDoctorsOnAboutPage: true,
    showTestimonials: true,
    showServices: true,
    showContactForm: true,
    showAppointmentBooking: true
  });

  // State for system settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    maxFileUploadSize: 5242880,
    sessionTimeout: 3600000,
    enableNotifications: true,
    enableAnalytics: false
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Initialize form data when settings are loaded
  React.useEffect(() => {
    if (settingsData?.settings) {
      const settings = settingsData.settings;
      setFormData({
        websiteName: settings.websiteName || '',
        websiteDescription: settings.websiteDescription || '',
        contactInfo: {
          phone: settings.contactInfo?.phone || '',
          email: settings.contactInfo?.email || '',
          address: settings.contactInfo?.address || '',
          website: settings.contactInfo?.website || ''
        },
        socialMedia: {
          facebook: settings.socialMedia?.facebook || '',
          instagram: settings.socialMedia?.instagram || '',
          twitter: settings.socialMedia?.twitter || '',
          linkedin: settings.socialMedia?.linkedin || '',
          youtube: settings.socialMedia?.youtube || ''
        },
        seoSettings: {
          metaTitle: settings.seoSettings?.metaTitle || '',
          metaDescription: settings.seoSettings?.metaDescription || '',
          metaKeywords: settings.seoSettings?.metaKeywords || ''
        },
        analyticsSettings: {
          googleAnalyticsId: settings.analyticsSettings?.googleAnalyticsId || '',
          facebookPixelId: settings.analyticsSettings?.facebookPixelId || ''
        }
      });

      setDisplaySettings(settings.displaySettings || {
        showDoctorsOnAboutPage: true,
        showTestimonials: true,
        showServices: true,
        showContactForm: true,
        showAppointmentBooking: true
      });

      setSystemSettings({
        maintenanceMode: settings.systemSettings?.maintenanceMode || false,
        maxFileUploadSize: settings.systemSettings?.maxFileUploadSize || 5242880,
        sessionTimeout: settings.systemSettings?.sessionTimeout || 3600000,
        enableNotifications: settings.systemSettings?.enableNotifications || true,
        enableAnalytics: settings.analyticsSettings?.enableAnalytics || false
      });

      if (settings.websiteLogo?.url) {
        setLogoPreview(settings.websiteLogo.url);
      }
    }
  }, [settingsData]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleDisplaySettingChange = async (key, value) => {
    try {
      await updateSpecificSetting({
        section: 'displaySettings',
        key,
        value
      }).unwrap();
      
      setDisplaySettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      toast({
        title: 'Setting Updated',
        description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSystemSettingChange = async (key, value) => {
    try {
      const section = key === 'enableAnalytics' ? 'analyticsSettings' : 'systemSettings';
      await updateSpecificSetting({
        section,
        key,
        value
      }).unwrap();
      
      setSystemSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      toast({
        title: 'Setting Updated',
        description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setLogoFile(file);
  };

  const handleRemoveLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setLogoFile(null);
  };

  const handleSaveAll = async () => {
    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'contactInfo' || key === 'socialMedia' || key === 'seoSettings' || key === 'analyticsSettings') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add logo file if selected
      if (logoFile) {
        submitData.append('websiteLogo', logoFile);
      }

      await updateSettings(submitData).unwrap();
      
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoadingSettings) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading settings...</Text>
        </VStack>
      </Center>
    );
  }

  if (settingsError) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            Failed to load settings. Please try again.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg" color="#2BA8D1">
            <Icon as={MdSettings} mr={2} />
            Website Settings
          </Heading>
          <Button
            leftIcon={<Icon as={MdSave} />}
            onClick={handleSaveAll}
            isLoading={isUpdatingSettings}
            loadingText="Saving..."
            bg="#2BA8D1"
            color="white"
            _hover={{
              bg: '#0C2F4D',
              color: "white",
              transform: "translateY(-2px)",
              boxShadow: "0 10px 25px rgba(43, 168, 209, 0.3)"
            }}
            _active={{
              bg: '#0C2F4D',
              color: "white",
              transform: "translateY(0px)"
            }}
          >
            Save All Changes
          </Button>
        </Flex>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Basic Information</Tab>
            <Tab>Display Settings</Tab>
            <Tab>Contact & Social</Tab>
            <Tab>SEO & Analytics</Tab>
            <Tab>System Settings</Tab>
          </TabList>

          <TabPanels>
            {/* Basic Information Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader bg={headerBg}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Website Basic Information
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Website Name</FormLabel>
                          <Input
                            value={formData.websiteName}
                            onChange={(e) => handleInputChange('websiteName', e.target.value)}
                            placeholder="Enter website name"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Website Logo</FormLabel>
                          <VStack spacing={4} align="stretch">
                            {logoPreview ? (
                              <Box position="relative" display="inline-block">
                                <Image
                                  src={logoPreview}
                                  alt="Logo preview"
                                  maxW="150px"
                                  maxH="150px"
                                  objectFit="contain"
                                  borderRadius="md"
                                  border="1px solid"
                                  borderColor={borderColor}
                                />
                                <IconButton
                                  aria-label="Remove logo"
                                  icon={<Icon as={MdClose} />}
                                  size="sm"
                                  colorScheme="red"
                                  position="absolute"
                                  top={2}
                                  right={2}
                                  onClick={handleRemoveLogo}
                                />
                              </Box>
                            ) : (
                              <Box
                                border="2px dashed"
                                borderColor={borderColor}
                                borderRadius="md"
                                p={8}
                                textAlign="center"
                              >
                                <Text color="gray.500" mb={4}>
                                  No logo selected
                                </Text>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLogoUpload}
                                  size="sm"
                                />
                              </Box>
                            )}
                            {!logoPreview && (
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                size="sm"
                              />
                            )}
                          </VStack>
                        </FormControl>
                      </GridItem>

                      <GridItem colSpan={{ base: 1, md: 2 }}>
                        <FormControl>
                          <FormLabel>Website Description</FormLabel>
                          <Textarea
                            value={formData.websiteDescription}
                            onChange={(e) => handleInputChange('websiteDescription', e.target.value)}
                            placeholder="Enter website description"
                            rows={3}
                          />
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Display Settings Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader bg={headerBg}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Display Settings
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {Object.entries(displaySettings).map(([key, value]) => (
                        <HStack key={key} justify="space-between" p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" textTransform="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {key === 'showDoctorsOnAboutPage' && 'Show doctors section on the About page'}
                              {key === 'showTestimonials' && 'Show testimonials section on the website'}
                              {key === 'showServices' && 'Show services section on the website'}
                              {key === 'showContactForm' && 'Show contact form on the website'}
                              {key === 'showAppointmentBooking' && 'Show appointment booking functionality'}
                            </Text>
                          </VStack>
                          <Switch
                            isChecked={value}
                            onChange={(e) => handleDisplaySettingChange(key, e.target.checked)}
                            colorScheme="blue"
                            size="lg"
                            isDisabled={isUpdatingSpecific}
                          />
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Contact & Social Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader bg={headerBg}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Contact Information
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Phone Number</FormLabel>
                          <Input
                            value={formData.contactInfo.phone}
                            onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                            placeholder="Enter phone number"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Email Address</FormLabel>
                          <Input
                            type="email"
                            value={formData.contactInfo.email}
                            onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                            placeholder="Enter email address"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Address</FormLabel>
                          <Input
                            value={formData.contactInfo.address}
                            onChange={(e) => handleInputChange('contactInfo.address', e.target.value)}
                            placeholder="Enter address"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel>Website URL</FormLabel>
                          <Input
                            value={formData.contactInfo.website}
                            onChange={(e) => handleInputChange('contactInfo.website', e.target.value)}
                            placeholder="Enter website URL"
                          />
                        </FormControl>
                      </GridItem>
                    </Grid>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader bg={headerBg}>
                    <Text fontSize="lg" fontWeight="semibold">
                      Social Media Links
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      {Object.entries(formData.socialMedia).map(([platform, url]) => (
                        <GridItem key={platform}>
                          <FormControl>
                            <FormLabel textTransform="capitalize">
                              {platform}
                            </FormLabel>
                            <Input
                              value={url}
                              onChange={(e) => handleInputChange(`socialMedia.${platform}`, e.target.value)}
                              placeholder={`Enter ${platform} URL`}
                            />
                          </FormControl>
                        </GridItem>
                      ))}
                    </Grid>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* SEO & Analytics Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader bg={headerBg}>
                    <Text fontSize="lg" fontWeight="semibold">
                      SEO Settings
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Meta Title</FormLabel>
                        <Input
                          value={formData.seoSettings.metaTitle}
                          onChange={(e) => handleInputChange('seoSettings.metaTitle', e.target.value)}
                          placeholder="Enter meta title"
                          maxLength={60}
                        />
                        <Text fontSize="sm" color="gray.500">
                          {formData.seoSettings.metaTitle.length}/60 characters
                        </Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Meta Description</FormLabel>
                        <Textarea
                          value={formData.seoSettings.metaDescription}
                          onChange={(e) => handleInputChange('seoSettings.metaDescription', e.target.value)}
                          placeholder="Enter meta description"
                          rows={3}
                          maxLength={160}
                        />
                        <Text fontSize="sm" color="gray.500">
                          {formData.seoSettings.metaDescription.length}/160 characters
                        </Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Meta Keywords</FormLabel>
                        <Input
                          value={formData.seoSettings.metaKeywords}
                          onChange={(e) => handleInputChange('seoSettings.metaKeywords', e.target.value)}
                          placeholder="Enter meta keywords (comma separated)"
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader bg={headerBg}>
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="semibold">
                        Analytics Settings
                      </Text>
                      <Switch
                        isChecked={systemSettings.enableAnalytics}
                        onChange={(e) => handleSystemSettingChange('enableAnalytics', e.target.checked)}
                        colorScheme="blue"
                        isDisabled={isUpdatingSpecific}
                      />
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl isDisabled={!systemSettings.enableAnalytics}>
                        <FormLabel>Google Analytics ID</FormLabel>
                        <Input
                          value={formData.analyticsSettings.googleAnalyticsId}
                          onChange={(e) => handleInputChange('analyticsSettings.googleAnalyticsId', e.target.value)}
                          placeholder="Enter Google Analytics ID"
                        />
                      </FormControl>

                      <FormControl isDisabled={!systemSettings.enableAnalytics}>
                        <FormLabel>Facebook Pixel ID</FormLabel>
                        <Input
                          value={formData.analyticsSettings.facebookPixelId}
                          onChange={(e) => handleInputChange('analyticsSettings.facebookPixelId', e.target.value)}
                          placeholder="Enter Facebook Pixel ID"
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* System Settings Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderColor={borderColor}>
                  <CardHeader bg={headerBg}>
                    <Text fontSize="lg" fontWeight="semibold">
                      System Settings
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between" p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Maintenance Mode</Text>
                          <Text fontSize="sm" color="gray.600">
                            Enable maintenance mode to temporarily disable the website
                          </Text>
                        </VStack>
                        <Switch
                          isChecked={systemSettings.maintenanceMode}
                          onChange={(e) => handleSystemSettingChange('maintenanceMode', e.target.checked)}
                          colorScheme="red"
                          isDisabled={isUpdatingSpecific}
                        />
                      </HStack>

                      <HStack justify="space-between" p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Enable Notifications</Text>
                          <Text fontSize="sm" color="gray.600">
                            Enable system notifications and alerts
                          </Text>
                        </VStack>
                        <Switch
                          isChecked={systemSettings.enableNotifications}
                          onChange={(e) => handleSystemSettingChange('enableNotifications', e.target.checked)}
                          colorScheme="blue"
                          isDisabled={isUpdatingSpecific}
                        />
                      </HStack>

                      <HStack justify="space-between" p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Max File Upload Size (MB)</Text>
                          <Text fontSize="sm" color="gray.600">
                            Maximum file size allowed for uploads
                          </Text>
                        </VStack>
                        <NumberInput
                          value={Math.round(systemSettings.maxFileUploadSize / 1024 / 1024)}
                          onChange={(value) => handleSystemSettingChange('maxFileUploadSize', parseInt(value) * 1024 * 1024)}
                          min={1}
                          max={100}
                          w="120px"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </HStack>

                      <HStack justify="space-between" p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Session Timeout (minutes)</Text>
                          <Text fontSize="sm" color="gray.600">
                            User session timeout duration
                          </Text>
                        </VStack>
                        <NumberInput
                          value={Math.round(systemSettings.sessionTimeout / 60000)}
                          onChange={(value) => handleSystemSettingChange('sessionTimeout', parseInt(value) * 60000)}
                          min={5}
                          max={1440}
                          w="120px"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default Settings;
