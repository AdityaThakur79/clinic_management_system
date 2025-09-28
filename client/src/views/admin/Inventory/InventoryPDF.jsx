import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontSize: 12,
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
    marginBottom: 4,
  },
  clinicSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 6,
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
    marginBottom: 4,
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
    width: 100,
    height: 100,
    marginRight: 20,
    objectFit: 'contain',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2BA8D1',
    marginBottom: 4,
  },
  deviceBrand: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  deviceModel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  devicePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2BA8D1',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2BA8D1',
    marginBottom: 10,
    borderBottom: '2px solid #2BA8D1',
    paddingBottom: 4,
  },
  table: {
    width: '100%',
    marginBottom: 10,
    border: '1px solid #dee2e6',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #dee2e6',
    minHeight: 20,
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    flex: 1,
    borderRight: '1px solid #dee2e6',
  },
  tableCellHeader: {
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#f8f9fa',
    flex: 1,
    borderRight: '1px solid #dee2e6',
  },
  description: {
    fontSize: 10,
    color: '#333',
    lineHeight: 1.4,
    marginBottom: 10,
  },
  dosDontsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dosColumn: {
    flex: 1,
    marginRight: 8,
  },
  dontsColumn: {
    flex: 1,
    marginLeft: 8,
  },
  dosTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  dontsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 4,
  },
  listItem: {
    fontSize: 9,
    color: '#333',
    marginBottom: 2,
    paddingLeft: 6,
  },
  dosItem: {
    fontSize: 9,
    color: '#28a745',
    marginBottom: 2,
    paddingLeft: 6,
  },
  dontsItem: {
    fontSize: 9,
    color: '#dc3545',
    marginBottom: 2,
    paddingLeft: 6,
  },
  careInstructions: {
    fontSize: 9,
    color: '#333',
    lineHeight: 1.3,
    backgroundColor: '#f8f9fa',
    padding: 6,
    borderRadius: 3,
    marginBottom: 10,
  },
  warrantySection: {
    backgroundColor: '#e3f2fd',
    padding: 6,
    borderRadius: 3,
    marginBottom: 10,
  },
  warrantyTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 2,
  },
  warrantyText: {
    fontSize: 9,
    color: '#333',
    lineHeight: 1.3,
  },
  troubleshootingSection: {
    marginBottom: 10,
  },
  troubleshootingItem: {
    marginBottom: 6,
    padding: 5,
    backgroundColor: '#fff3cd',
    borderRadius: 2,
  },
  troubleshootingIssue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 2,
  },
  troubleshootingSolution: {
    fontSize: 9,
    color: '#856404',
  },
  footer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderTop: '1px solid #dee2e6',
  },
  footerText: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  contactItem: {
    fontSize: 8,
    color: '#6c757d',
  },
});

const InventoryPDF = ({ inventory, clinicInfo }) => {

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Add comprehensive error handling
  if (!inventory) {

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

          {/* Combined Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Information</Text>
            
            {/* Description */}
            {safeInventory.description && (
              <Text style={styles.description}>{safeInventory.description}</Text>
            )}

            {/* Dos and Don'ts - Custom Table Format */}
            {(safeInventory.dosAndDonts.dos.length > 0 || safeInventory.dosAndDonts.donts.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Care Guidelines</Text>
                <View style={styles.table}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCellHeader, { color: '#28a745', flex: 0.5 }]}>
                        ✓ DO's
                      </Text>
                      <Text style={[styles.tableCellHeader, { color: '#dc3545', flex: 0.5 }]}>
                        ✗ DON'Ts
                      </Text>
                    </View>
                  </View>
                  {/* Table Body */}
                  {Array.from({ length: Math.max(safeInventory.dosAndDonts.dos.length, safeInventory.dosAndDonts.donts.length) }, (_, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { color: '#28a745' }]}>
                        {safeInventory.dosAndDonts.dos[index] ? `• ${safeInventory.dosAndDonts.dos[index]}` : ''}
                      </Text>
                      <Text style={[styles.tableCell, { color: '#dc3545' }]}>
                        {safeInventory.dosAndDonts.donts[index] ? `• ${safeInventory.dosAndDonts.donts[index]}` : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Care Instructions - Compact */}
            {safeInventory.careInstructions && (
              <Text style={styles.careInstructions}>
                <Text style={styles.warrantyTitle}>Care: </Text>
                {safeInventory.careInstructions.length > 150 
                  ? safeInventory.careInstructions.substring(0, 150) + '...'
                  : safeInventory.careInstructions
                }
              </Text>
            )}

            {/* Warranty Information - Compact */}
            {(safeInventory.warrantyInfo.duration || safeInventory.warrantyInfo.conditions) && (
              <View style={styles.warrantySection}>
                {safeInventory.warrantyInfo.duration && (
                  <Text style={styles.warrantyText}>
                    <Text style={styles.warrantyTitle}>Warranty: </Text>
                    {safeInventory.warrantyInfo.duration}
                  </Text>
                )}
                {safeInventory.warrantyInfo.conditions && (
                  <Text style={styles.warrantyText}>
                    <Text style={styles.warrantyTitle}>Terms: </Text>
                    {safeInventory.warrantyInfo.conditions.length > 100 
                      ? safeInventory.warrantyInfo.conditions.substring(0, 100) + '...'
                      : safeInventory.warrantyInfo.conditions
                    }
                  </Text>
                )}
              </View>
            )}

            {/* Troubleshooting - Custom Table Format */}
            {safeInventory.troubleshooting.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Troubleshooting Guide</Text>
                <View style={styles.table}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCellHeader, { flex: 0.4 }]}>
                        Issue
                      </Text>
                      <Text style={[styles.tableCellHeader, { flex: 0.6 }]}>
                        Solution
                      </Text>
                    </View>
                  </View>
                  {/* Table Body */}
                  {safeInventory.troubleshooting.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { color: '#856404', fontWeight: 'bold' }]}>
                        {item.issue}
                      </Text>
                      <Text style={[styles.tableCell, { color: '#856404' }]}>
                        {item.solution}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        {/* <View style={styles.footer}>
          <Text style={styles.footerText}>
            For support: 7977483031 | aartiketspeechandhearing@gmail.com | aartiketspeechandhearingcare.in
          </Text>
        </View> */}
      </Page>
    </Document>
  );
};

export default InventoryPDF;
