/* eslint-disable */
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
// chakra imports
import {
  Box,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  Collapse,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';

export function SidebarLinks(props) {
  //   Chakra color mode
  let location = useLocation();
  let activeColor = useColorModeValue('#3AC0E7', 'white');
  let inactiveColor = useColorModeValue(
    'secondaryGray.600',
    'secondaryGray.600',
  );
  let activeIcon = useColorModeValue('#3AC0E7', 'white');
  let textColor = useColorModeValue('secondaryGray.500', 'white');
  let brandColor = useColorModeValue('#3AC0E7', 'brand.400');
  let submenuBg = useColorModeValue('gray.50', 'gray.700');

  const {
    routes,
    isCollapsed = false,
    setIsCollapsed,
    activeParentIndex,
    setActiveParentIndex,
  } = props;
  const [expandedItems, setExpandedItems] = useState({});

  const renderRouteIcon = (icon) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      const desiredSize = isCollapsed ? '26px' : icon.props.width || '20px';
      const desiredHeight = isCollapsed ? '26px' : icon.props.height || '20px';
      return React.cloneElement(icon, {
        width: desiredSize,
        height: desiredHeight,
      });
    }
    return icon;
  };

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  // Check if any child route is active
  const hasActiveChild = (children) => {
    if (!children) return false;
    return children.some((child) => activeRoute(child.path.toLowerCase()));
  };

  // Toggle expanded state
  const toggleExpanded = (index) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    if (setActiveParentIndex) {
      setActiveParentIndex(index);
    }
    // Expand sidebar when user interacts with a parent
    if (setIsCollapsed) {
      setIsCollapsed(false);
    }
  };

  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createLinks = (routes) => {
    const visibleRoutes = (routes || []).filter((r) => !r.hidden);
    return visibleRoutes.map((route, index) => {
      const isExpanded = expandedItems[index];
      const hasChildren = route.children && route.children.length > 0;
      const isChildActive = hasActiveChild(route.children);
      const isMainRouteActive = activeRoute(route.path.toLowerCase());

      if (route.category) {
        return (
          <React.Fragment key={index}>
            <Text
              fontSize={'md'}
              color={activeColor}
              fontWeight="bold"
              mx="auto"
              ps={{
                sm: '10px',
                xl: '16px',
              }}
              pt="18px"
              pb="12px"
            >
              {route.name}
            </Text>
            {createLinks(route.items)}
          </React.Fragment>
        );
      } else if (
        route.layout === '/admin' ||
        route.layout === '/auth' ||
        route.layout === '/rtl'
      ) {
        // Main menu item with children (collapsible)
        if (hasChildren) {
          const visibleChildren = route.children.filter((c) => !c.hidden);
          return (
            <Box key={index} mb="4px">
              <Box
                onClick={() => toggleExpanded(index)}
                cursor="pointer"
                _hover={{ bg: submenuBg }}
                borderRadius="8px"
                mx="4px"
                py="8px"
                px="10px"
                bg={
                  isMainRouteActive || isChildActive ? submenuBg : 'transparent'
                }
              >
                <HStack
                  spacing={isCollapsed ? '0' : '26px'}
                  py="5px"
                  ps={isCollapsed ? '6px' : '10px'}
                  pe={isCollapsed ? '24px' : '10px'}
                >
                  <Flex
                    w="100%"
                    alignItems="center"
                    justifyContent={isCollapsed ? 'center' : 'center'}
                  >
                    <Box
                      color={
                        isMainRouteActive || isChildActive
                          ? activeIcon
                          : textColor
                      }
                      me={isCollapsed ? '0' : '18px'}
                    >
                      {renderRouteIcon(route.icon)}
                    </Box>
                    {!isCollapsed && (
                      <>
                        <Text
                          me="auto"
                          color={
                            isMainRouteActive || isChildActive
                              ? activeColor
                              : textColor
                          }
                          fontWeight={
                            isMainRouteActive || isChildActive
                              ? 'bold'
                              : 'normal'
                          }
                        >
                          {route.name}
                        </Text>
                        <IconButton
                          aria-label="Toggle submenu"
                          icon={
                            isExpanded ? (
                              <ChevronDownIcon />
                            ) : (
                              <ChevronRightIcon />
                            )
                          }
                          size="sm"
                          variant="ghost"
                          color={textColor}
                        />
                      </>
                    )}
                  </Flex>
                </HStack>
              </Box>
              {!isCollapsed && (
                <Collapse in={isExpanded} animateOpacity>
                  <VStack spacing="0" align="stretch" pl="20px" pr="10px">
                    {visibleChildren.map((child, childIndex) => (
                      <NavLink
                        key={childIndex}
                        to={child.layout + child.path}
                        style={{ textDecoration: 'none' }}
                        onClick={() => {
                          // Auto-collapse when navigating to child
                          if (setIsCollapsed) setIsCollapsed(true);
                        }}
                      >
                        <Box
                          _hover={{ bg: submenuBg }}
                          borderRadius="6px"
                          py="10px"
                          px="10px"
                          mt="4px"
                          bg={
                            activeRoute(child.path.toLowerCase())
                              ? submenuBg
                              : 'transparent'
                          }
                          borderLeft={
                            activeRoute(child.path.toLowerCase())
                              ? '3px solid'
                              : '3px solid transparent'
                          }
                          borderLeftColor={
                            activeRoute(child.path.toLowerCase())
                              ? brandColor
                              : 'transparent'
                          }
                        >
                          <Text
                            fontSize="sm"
                            color={
                              activeRoute(child.path.toLowerCase())
                                ? activeColor
                                : textColor
                            }
                            fontWeight={
                              activeRoute(child.path.toLowerCase())
                                ? 'bold'
                                : 'normal'
                            }
                            pl="20px"
                          >
                            {child.name}
                          </Text>
                        </Box>
                      </NavLink>
                    ))}
                  </VStack>
                </Collapse>
              )}
            </Box>
          );
        } else {
          // Regular menu item without children
          return (
            <NavLink key={index} to={route.layout + route.path}>
              {route.icon ? (
                <Box
                  mx="4px"
                  py="8px"
                  px="10px"
                  borderRadius="8px"
                  _hover={{ bg: submenuBg }}
                  bg={
                    activeRoute(route.path.toLowerCase())
                      ? submenuBg
                      : 'transparent'
                  }
                >
                  <HStack
                    spacing={
                      isCollapsed
                        ? '0'
                        : activeRoute(route.path.toLowerCase())
                        ? '22px'
                        : '26px'
                    }
                    py='5px'
                    ps='24px'>
                    <Flex w='100%' alignItems='center' justifyContent='center'>
                      <Box
                        color={
                          activeRoute(route.path.toLowerCase())
                            ? activeIcon
                            : textColor
                        }
                        me={isCollapsed ? '0' : '18px'}
                      >
                        {renderRouteIcon(route.icon)}
                      </Box>
                      {!isCollapsed && (
                        <Text
                          me="auto"
                          color={
                            activeRoute(route.path.toLowerCase())
                              ? activeColor
                              : textColor
                          }
                          fontWeight={
                            activeRoute(route.path.toLowerCase())
                              ? 'bold'
                              : 'normal'
                          }
                        >
                          {route.name}
                        </Text>
                      )}
                    </Flex>
                    {!isCollapsed && (
                      <Box
                        h="36px"
                        w="4px"
                        bg={
                          activeRoute(route.path.toLowerCase())
                            ? brandColor
                            : 'transparent'
                        }
                        borderRadius="5px"
                      />
                    )}
                  </HStack>
                </Box>
              ) : (
                <Box>
                  <HStack
                    spacing={
                      isCollapsed
                        ? '0'
                        : activeRoute(route.path.toLowerCase())
                        ? '22px'
                        : '26px'
                    }
                    py="5px"
                    ps={isCollapsed ? '6px' : '10px'}
                    pe={isCollapsed ? '24px' : '10px'}
                  >
                    {!isCollapsed && (
                      <Text
                        me="auto"
                        color={
                          activeRoute(route.path.toLowerCase())
                            ? activeColor
                            : inactiveColor
                        }
                        fontWeight={
                          activeRoute(route.path.toLowerCase())
                            ? 'bold'
                            : 'normal'
                        }
                      >
                        {route.name}
                      </Text>
                    )}
                    {!isCollapsed && (
                      <Box h="36px" w="4px" bg="brand.400" borderRadius="5px" />
                    )}
                  </HStack>
                </Box>
              )}
            </NavLink>
          );
        }
      }
    });
  };
  //  BRAND
  return createLinks(routes);
}

export default SidebarLinks;
