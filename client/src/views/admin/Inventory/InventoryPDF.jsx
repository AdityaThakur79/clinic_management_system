import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontSize: 11,
    lineHeight: 1.4,
  },
  header: {
    backgroundColor: '#2BA8D1',
    padding: 16,
    color: 'white',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  clinicInfo: { 
    flexDirection: 'column', 
    alignItems: 'flex-start' 
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  clinicSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 10,
  },
  clinicAddress: {
    fontSize: 10,
    color: 'white',
    opacity: 0.9,
  },
  documentInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  documentDate: {
    fontSize: 10,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  deviceImage: {
    width: 120,
    height: 120,
    marginRight: 20,
    objectFit: 'contain',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2BA8D1',
    marginBottom: 8,
  },
  deviceBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deviceModel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  devicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2BA8D1',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2BA8D1',
    marginBottom: 10,
    borderBottom: '2px solid #2BA8D1',
    paddingBottom: 5,
  },
  description: {
    fontSize: 11,
    color: '#333',
    lineHeight: 1.5,
    marginBottom: 15,
  },
  dosDontsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dosColumn: {
    flex: 1,
    marginRight: 10,
  },
  dontsColumn: {
    flex: 1,
    marginLeft: 10,
  },
  dosTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  dontsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 10,
    color: '#333',
    marginBottom: 4,
    paddingLeft: 8,
  },
  dosItem: {
    fontSize: 10,
    color: '#28a745',
    marginBottom: 4,
    paddingLeft: 8,
  },
  dontsItem: {
    fontSize: 10,
    color: '#dc3545',
    marginBottom: 4,
    paddingLeft: 8,
  },
  careInstructions: {
    fontSize: 11,
    color: '#333',
    lineHeight: 1.5,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  warrantySection: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  warrantyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  warrantyText: {
    fontSize: 10,
    color: '#333',
    lineHeight: 1.4,
  },
  troubleshootingSection: {
    marginBottom: 15,
  },
  troubleshootingItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 3,
  },
  troubleshootingIssue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 3,
  },
  troubleshootingSolution: {
    fontSize: 10,
    color: '#856404',
  },
  footer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderTop: '1px solid #dee2e6',
  },
  footerText: {
    fontSize: 9,
    color: '#6c757d',
    textAlign: 'center',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  contactItem: {
    fontSize: 9,
    color: '#6c757d',
  },
});

const InventoryPDF = ({ inventory, clinicInfo }) => {
  console.log('InventoryPDF rendering with:', { inventory, clinicInfo });
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Add comprehensive error handling
  if (!inventory) {
    console.error('No inventory data provided to PDF');
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.content}>
            <Text>Error: No inventory data available</Text>
          </View>
        </Page>
      </Document>
    );
  }

  // Validate required fields
  if (!inventory.deviceName) {
    console.error('Missing device name in inventory data');
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.content}>
            <Text>Error: Missing device name</Text>
          </View>
        </Page>
      </Document>
    );
  }

  // Safely access nested properties
  const safeInventory = {
    deviceName: inventory.deviceName || 'Unknown Device',
    brand: inventory.brand || 'Unknown Brand',
    model: inventory.model || 'Unknown Model',
    sellingPrice: inventory.sellingPrice || 0,
    description: inventory.description || '',
    deviceImage: inventory.deviceImage || { url: '', publicId: '' },
    dosAndDonts: inventory.dosAndDonts || { dos: [], donts: [] },
    careInstructions: inventory.careInstructions || '',
    warrantyInfo: inventory.warrantyInfo || { duration: '', conditions: '' },
    troubleshooting: inventory.troubleshooting || []
  };

  console.log('Safe inventory data:', safeInventory);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image
                style={styles.logo}
                src="/aartiket_logo.jpeg"
              />
              <View style={styles.clinicInfo}>
                                <Text style={styles.clinicName}>
                                  Aartiket Speech & Hearing Care
                                </Text>
                                <Text style={styles.clinicSubtitle}>
                                  Hearing Care Specialists
                                </Text>
                                <Text style={styles.clinicAddress}>
                                  Your Clinic Address
                                </Text>
              </View>
            </View>
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>Device Information</Text>
              <Text style={styles.documentDate}>{currentDate}</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Device Header with Image */}
          <View style={styles.deviceHeader}>
            {safeInventory.deviceImage.url && (
              <Image
                style={styles.deviceImage}
                src={safeInventory.deviceImage.url}
              />
            )}
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{safeInventory.deviceName}</Text>
              <Text style={styles.deviceBrand}>Brand: {safeInventory.brand}</Text>
              <Text style={styles.deviceModel}>Model: {safeInventory.model}</Text>
              <Text style={styles.devicePrice}>Rs {safeInventory.sellingPrice}</Text>
            </View>
          </View>

          {/* Description */}
          {safeInventory.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{safeInventory.description}</Text>
            </View>
          )}

          {/* Dos and Don'ts */}
          {(safeInventory.dosAndDonts.dos.length > 0 || safeInventory.dosAndDonts.donts.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Care Guidelines</Text>
              <View style={styles.dosDontsContainer}>
                {safeInventory.dosAndDonts.dos.length > 0 && (
                  <View style={styles.dosColumn}>
                    <Text style={styles.dosTitle}>✓ DO's</Text>
                    {safeInventory.dosAndDonts.dos.map((item, index) => (
                      <Text key={index} style={styles.dosItem}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                )}
                {safeInventory.dosAndDonts.donts.length > 0 && (
                  <View style={styles.dontsColumn}>
                    <Text style={styles.dontsTitle}>✗ DON'Ts</Text>
                    {safeInventory.dosAndDonts.donts.map((item, index) => (
                      <Text key={index} style={styles.dontsItem}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Care Instructions */}
          {safeInventory.careInstructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Care Instructions</Text>
              <Text style={styles.careInstructions}>{safeInventory.careInstructions}</Text>
            </View>
          )}

          {/* Warranty Information */}
          {(safeInventory.warrantyInfo.duration || safeInventory.warrantyInfo.conditions) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Warranty Information</Text>
              <View style={styles.warrantySection}>
                {safeInventory.warrantyInfo.duration && (
                  <Text style={styles.warrantyText}>
                    <Text style={styles.warrantyTitle}>Duration: </Text>
                    {safeInventory.warrantyInfo.duration}
                  </Text>
                )}
                {safeInventory.warrantyInfo.conditions && (
                  <Text style={styles.warrantyText}>
                    <Text style={styles.warrantyTitle}>Conditions: </Text>
                    {safeInventory.warrantyInfo.conditions}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Troubleshooting */}
          {safeInventory.troubleshooting.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Troubleshooting</Text>
              <View style={styles.troubleshootingSection}>
                {safeInventory.troubleshooting.map((item, index) => (
                  <View key={index} style={styles.troubleshootingItem}>
                    <Text style={styles.troubleshootingIssue}>
                      Issue: {item.issue}
                    </Text>
                    <Text style={styles.troubleshootingSolution}>
                      Solution: {item.solution}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For any questions or support, please contact us
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactItem}>
              Phone: 7977483031
            </Text>
            <Text style={styles.contactItem}>
              Email: aartiketspeechandhearing@gmail.com
            </Text>
            <Text style={styles.contactItem}>
              Website: aartiketspeechandhearingcare.in
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InventoryPDF;
