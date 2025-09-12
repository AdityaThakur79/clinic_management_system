import React from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Divider,
} from '@chakra-ui/react';

const ButtonShowcase = () => {
  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={2} color="gray.700">
            Button Variants Showcase
          </Heading>
          <Text color="gray.600">
            Professional button styles with smooth animations and hover effects
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {/* Primary Buttons */}
          <Card borderRadius="xl" boxShadow="lg">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="lg" color="gray.700">
                  Primary Buttons
                </Text>
                <Divider />
                <VStack spacing={3}>
                  <Button variant="primary" size="sm">
                    Small Primary
                  </Button>
                  <Button variant="primary" size="md">
                    Medium Primary
                  </Button>
                  <Button variant="primary" size="lg">
                    Large Primary
                  </Button>
                  <Button variant="primary" size="lg" isLoading>
                    Loading Primary
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Outline Buttons */}
          <Card borderRadius="xl" boxShadow="lg">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="lg" color="gray.700">
                  Outline Buttons
                </Text>
                <Divider />
                <VStack spacing={3}>
                  <Button variant="outline" size="sm">
                    Small Outline
                  </Button>
                  <Button variant="outline" size="md">
                    Medium Outline
                  </Button>
                  <Button variant="outline" size="lg">
                    Large Outline
                  </Button>
                  <Button variant="outline" size="lg" isDisabled>
                    Disabled Outline
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Secondary Buttons */}
          <Card borderRadius="xl" boxShadow="lg">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="lg" color="gray.700">
                  Secondary Buttons
                </Text>
                <Divider />
                <VStack spacing={3}>
                  <Button variant="secondary" size="sm">
                    Small Secondary
                  </Button>
                  <Button variant="secondary" size="md">
                    Medium Secondary
                  </Button>
                  <Button variant="secondary" size="lg">
                    Large Secondary
                  </Button>
                  <Button variant="secondary" size="lg" isDisabled>
                    Disabled Secondary
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Danger Buttons */}
          <Card borderRadius="xl" boxShadow="lg">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="lg" color="gray.700">
                  Danger Buttons
                </Text>
                <Divider />
                <VStack spacing={3}>
                  <Button variant="danger" size="sm">
                    Small Danger
                  </Button>
                  <Button variant="danger" size="md">
                    Medium Danger
                  </Button>
                  <Button variant="danger" size="lg">
                    Large Danger
                  </Button>
                  <Button variant="danger" size="lg" isDisabled>
                    Disabled Danger
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Button Groups */}
        <Card borderRadius="xl" boxShadow="lg">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Text fontWeight="bold" fontSize="lg" color="gray.700">
                Button Groups & Combinations
              </Text>
              <Divider />
              
              {/* Form Actions */}
              <Box>
                <Text fontWeight="semibold" mb={3} color="gray.600">
                  Form Actions
                </Text>
                <HStack spacing={4}>
                  <Button variant="secondary" size="lg">
                    Cancel
                  </Button>
                  <Button variant="primary" size="lg">
                    Save Changes
                  </Button>
                </HStack>
              </Box>

              {/* Dialog Actions */}
              <Box>
                <Text fontWeight="semibold" mb={3} color="gray.600">
                  Dialog Actions
                </Text>
                <HStack spacing={4}>
                  <Button variant="outline" size="md">
                    Cancel
                  </Button>
                  <Button variant="danger" size="md">
                    Delete
                  </Button>
                </HStack>
              </Box>

              {/* Icon Buttons */}
              <Box>
                <Text fontWeight="semibold" mb={3} color="gray.600">
                  Icon Buttons
                </Text>
                <HStack spacing={4}>
                  <Button variant="primary" size="lg" leftIcon="+">
                    Add New
                  </Button>
                  <Button variant="outline" size="lg" leftIcon="✏️">
                    Edit
                  </Button>
                  <Button variant="secondary" size="lg" leftIcon="👁️">
                    View
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Usage Examples */}
        <Card borderRadius="xl" boxShadow="lg" bg="blue.50">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" fontSize="lg" color="blue.700">
                Usage Examples
              </Text>
              <Divider borderColor="blue.200" />
              <VStack spacing={3} align="stretch" fontSize="sm" color="blue.600">
                <Text>
                  <strong>Primary:</strong> Main actions (Save, Submit, Add)
                </Text>
                <Text>
                  <strong>Outline:</strong> Secondary actions (Cancel, Reset)
                </Text>
                <Text>
                  <strong>Secondary:</strong> Neutral actions (View, Edit)
                </Text>
                <Text>
                  <strong>Danger:</strong> Destructive actions (Delete, Remove)
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default ButtonShowcase;
