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
    justifyContent: 'space-between',
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
  clinicInfo: { flexDirection: 'column', alignItems: 'flex-start' },
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
    marginBottom: 3,
  },
  invoiceDetails: { alignItems: 'flex-end' },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  invoiceInfo: {
    fontSize: 10,
    color: 'white',
    opacity: 0.9,
    marginBottom: 3,
  },
  statusBadge: {
    backgroundColor: '#10B981',
    color: 'white',
    padding: '5 10',
    borderRadius: 5,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
  },
  content: { padding: 20, flexGrow: 1, justifyContent: 'space-between' },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2BA8D1',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2BA8D1',
    paddingBottom: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoColumn: {
    width: '48%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  infoValue: {
    fontSize: 10,
    color: '#333',
  },
  infoValueBold: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    backgroundColor: '#2BA8D1',
    flexDirection: 'row',
    padding: 6,
  },
  tableHeaderText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 6,
  },
  tableCell: { fontSize: 9, color: '#333' },
  tableCellBold: { fontSize: 9, fontWeight: 'bold', color: '#333' },
  tableCellRight: { fontSize: 9, color: '#333', textAlign: 'right' },
  tableCellBoldRight: { fontSize: 9, fontWeight: 'bold', color: '#333', textAlign: 'right' },
  serviceDescription: {
    width: '40%',
  },
  serviceDetails: {
    width: '35%',
  },
  serviceAmount: {
    width: '25%',
  },
  financialSummary: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  summaryBox: {
    width: 240,
    border: '1px solid #E5E7EB',
    padding: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2BA8D1',
    padding: 10,
    marginTop: 8,
    borderRadius: 5,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabelTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  summaryValueTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  prescriptionSection: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    marginTop: 12,
  },
  prescriptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2BA8D1',
    marginBottom: 15,
  },
  prescriptionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  prescriptionColumn: {
    width: '48%',
  },
  prescriptionBox: {
    backgroundColor: 'white',
    padding: 10,
    border: '1px solid #E5E7EB',
    borderRadius: 5,
  },
  prescriptionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  prescriptionText: {
    fontSize: 10,
    color: '#333',
  },
  medicineTable: {
    marginTop: 15,
  },
  medicineTableHeader: {
    backgroundColor: '#2BA8D1',
    flexDirection: 'row',
    padding: 6,
  },
  medicineTableHeaderText: { color: 'white', fontSize: 8, fontWeight: 'bold' },
  medicineTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 6,
    backgroundColor: 'white',
  },
  medicineTableCell: { fontSize: 8, color: '#333' },
  medicineTableCellBold: { fontSize: 8, fontWeight: 'bold', color: '#333' },
  medicineName: {
    width: '30%',
  },
  medicineDosage: {
    width: '25%',
  },
  medicineFrequency: {
    width: '25%',
  },
  medicineDuration: {
    width: '20%',
  },
  footer: {
    backgroundColor: '#2BA8D1',
    padding: 20,
    color: 'white',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 9,
    opacity: 0.9,
    marginBottom: 3,
  },
  footerTimestamp: {
    fontSize: 8,
    opacity: 0.7,
    marginTop: 10,
  },
});

const BillPDF = ({ appointment }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateSubtotal = (bill) => {
    if (!bill) return 0;
    let subtotal = (bill.consultationFee || 0) + 
                   (bill.treatmentFee || 0) + 
                   (bill.medicineFee || 0) + 
                   (bill.otherCharges || 0) +
                   (bill.hearingAidFee || 0) +
                   (bill.audiometryFee || 0);
    
    if (bill.services && bill.services.length > 0) {
      subtotal += bill.services.reduce((sum, service) => {
        const servicePrice = service.actualPrice || service.basePrice || 0;
        return sum + servicePrice;
      }, 0);
    }
    if (bill.devices && bill.devices.length > 0) {
      subtotal += bill.devices.reduce((sum, device) => {
        const qty = Number(device.quantity) || 0;
        const price = Number(device.unitPrice) || 0;
        return sum + (qty * price);
      }, 0);
    }
    
    return subtotal;
  };

  const calculateTotal = (bill) => {
    if (!bill) return 0;
    const subtotal = calculateSubtotal(bill);
    const discount = bill.discount || 0;
    const tax = bill.tax || 0;
    return subtotal - discount + tax;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image style={styles.logo} src="/aartiket_logo.jpeg" />
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>Aartiket Speech & Hearing Care</Text>
                <Text style={styles.clinicSubtitle}>Hearing test, hearing aid trial and fitting, speech therapy</Text>
                <Text style={styles.clinicAddress}>{appointment.branchId?.address || 'Ghatkopar, Mumbai'}</Text>
                <Text style={styles.clinicAddress}>79 7748 3031</Text>
                <Text style={styles.clinicAddress}>aartiketspeechandhearing@gmail.com</Text>
              </View>
            </View>
            <View style={styles.invoiceDetails}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceInfo}>Bill No: {appointment.billId?.billNumber || `BILL-${appointment._id.slice(-8).toUpperCase()}`}</Text>
              <Text style={styles.invoiceInfo}>Date: {formatDate(appointment.date)}</Text>
              <Text style={styles.invoiceInfo}>Time: {formatTime(appointment.timeSlot)}</Text>
              <View style={styles.statusBadge}>
                <Text>{appointment.status?.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Patient & Doctor Information */}
          <View style={styles.section}>
            <View style={styles.infoGrid}>
              <View style={styles.infoColumn}>
                <Text style={styles.sectionTitle}>Patient Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValueBold}>{appointment.patientId?.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Age:</Text>
                  <Text style={styles.infoValue}>{appointment.patientId?.age} years</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender:</Text>
                  <Text style={styles.infoValue}>{appointment.patientId?.gender}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Contact:</Text>
                  <Text style={styles.infoValue}>{appointment.patientId?.contact}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{appointment.patientId?.email}</Text>
                </View>
                {appointment.patientId?.address && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address:</Text>
                    <Text style={styles.infoValue}>{appointment.patientId.address}</Text>
                  </View>
                )}
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.sectionTitle}>Doctor Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValueBold}>{appointment.doctorId?.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Specialization:</Text>
                  <Text style={styles.infoValue}>{appointment.doctorId?.specialization}</Text>
                </View>
                {/* Removed doctor email from the bill as requested */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Branch:</Text>
                  <Text style={styles.infoValue}>{appointment.branchId?.branchName} - {appointment.branchId?.address}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Services & Charges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services & Charges</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.serviceDescription]}>Service Description</Text>
                <Text style={[styles.tableHeaderText, styles.serviceDetails]}>Details</Text>
                <Text style={[styles.tableHeaderText, styles.serviceAmount]}>Amount (Rs)</Text>
              </View>
              
              {/* Show only services with amount > 0 */}
              {(appointment.billId?.consultationFee || 0) > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCellBold, styles.serviceDescription]}>Consultation Fee</Text>
                  <Text style={[styles.tableCell, styles.serviceDetails]}>Doctor consultation and examination</Text>
                  <Text style={[styles.tableCellBoldRight, styles.serviceAmount]}>Rs {(appointment.billId.consultationFee || 0).toFixed(2)}</Text>
                </View>
              )}
              
              {(appointment.billId?.treatmentFee || 0) > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCellBold, styles.serviceDescription]}>Treatment Fee</Text>
                  <Text style={[styles.tableCell, styles.serviceDetails]}>Medical treatment and procedures</Text>
                  <Text style={[styles.tableCellBoldRight, styles.serviceAmount]}>Rs {(appointment.billId.treatmentFee || 0).toFixed(2)}</Text>
                </View>
              )}
              
              {(appointment.billId?.medicineFee || 0) > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCellBold, styles.serviceDescription]}>Medicine Fee</Text>
                  <Text style={[styles.tableCell, styles.serviceDetails]}>Prescribed medications and supplies</Text>
                  <Text style={[styles.tableCellBoldRight, styles.serviceAmount]}>Rs {(appointment.billId.medicineFee || 0).toFixed(2)}</Text>
                </View>
              )}
              
              {(appointment.billId?.otherCharges || 0) > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCellBold, styles.serviceDescription]}>Additional Services</Text>
                  <Text style={[styles.tableCell, styles.serviceDetails]}>Other medical services and tests</Text>
                  <Text style={[styles.tableCellBoldRight, styles.serviceAmount]}>Rs {(appointment.billId.otherCharges || 0).toFixed(2)}</Text>
                </View>
              )}
              
              {(appointment.billId?.hearingAidFee || 0) > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCellBold, styles.serviceDescription]}>Hearing Aid Services</Text>
                  <Text style={[styles.tableCell, styles.serviceDetails]}>Hearing aid fitting and maintenance</Text>
                  <Text style={[styles.tableCellBoldRight, styles.serviceAmount]}>Rs {(appointment.billId.hearingAidFee || 0).toFixed(2)}</Text>
                </View>
              )}
              
              {(appointment.billId?.audiometryFee || 0) > 0 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCellBold, styles.serviceDescription]}>Audiometry Test</Text>
                  <Text style={[styles.tableCell, styles.serviceDetails]}>Hearing assessment and testing</Text>
                  <Text style={[styles.tableCellBoldRight, styles.serviceAmount]}>Rs {(appointment.billId.audiometryFee || 0).toFixed(2)}</Text>
                </View>
              )}
              
              {/* Services from services array */}
              {appointment.billId?.services && appointment.billId.services.map((service, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCellBold, styles.serviceDescription]}>{service.name}</Text>
                  <Text style={[styles.tableCell, styles.serviceDetails]}>{service.description || 'Service provided'}</Text>
                  <Text style={[styles.tableCellBoldRight, styles.serviceAmount]}>Rs {((service.actualPrice || service.basePrice) || 0).toFixed(2)}</Text>
                </View>
              ))}
            </View>

            {/* Devices */}
            {appointment.billId?.devices && appointment.billId.devices.length > 0 && (
              <View style={[styles.table, { marginTop: 10 }] }>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.serviceDescription]}>Device</Text>
                  <Text style={[styles.tableHeaderText, styles.serviceDetails]}>Qty × Unit</Text>
                  <Text style={[styles.tableHeaderText, styles.serviceAmount]}>Total (Rs)</Text>
                </View>
                {appointment.billId.devices.map((device, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.tableCellBold, styles.serviceDescription]}>{device.deviceName}</Text>
                    <Text style={[styles.tableCell, styles.serviceDetails]}>{Number(device.quantity || 0)} × Rs {Number(device.unitPrice || 0).toFixed(2)}</Text>
                    <Text style={[styles.tableCellBoldRight, styles.serviceAmount]}>Rs {((Number(device.quantity) || 0) * (Number(device.unitPrice) || 0)).toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Financial Summary */}
            <View style={styles.financialSummary}>
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>Rs {calculateSubtotal(appointment.billId).toFixed(2)}</Text>
                </View>
                
                {appointment.billId?.discount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Discount {appointment.billId?.discountType === 'percentage' ? 
                      `(${appointment.billId?.discountPercentage}%)` : 
                      `(${appointment.billId?.discountType || 'General'})`}:</Text>
                    <Text style={[styles.summaryValue, { color: '#DC2626' }]}>-Rs {appointment.billId.discount.toFixed(2)}</Text>
                  </View>
                )}
                
                {/* Always show tax information */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (GST {appointment.billId?.taxPercentage || 18}%):</Text>
                  <Text style={styles.summaryValue}>Rs {(appointment.billId?.tax || 0).toFixed(2)}</Text>
                </View>
                
                <View style={styles.summaryRowTotal}>
                  <Text style={styles.summaryLabelTotal}>TOTAL AMOUNT:</Text>
                  <Text style={styles.summaryValueTotal}>Rs {calculateTotal(appointment.billId).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Prescription Section */}
          {appointment.prescription && (
            <View style={styles.prescriptionSection}>
              <Text style={styles.prescriptionTitle}>Prescription Details</Text>
              <View style={styles.prescriptionGrid}>
                {appointment.prescription.diagnosis && (
                  <View style={styles.prescriptionColumn}>
                    <Text style={styles.prescriptionLabel}>Diagnosis:</Text>
                    <View style={styles.prescriptionBox}>
                      <Text style={styles.prescriptionText}>{appointment.prescription.diagnosis}</Text>
                    </View>
                  </View>
                )}
                {appointment.prescription.treatment && (
                  <View style={styles.prescriptionColumn}>
                    <Text style={styles.prescriptionLabel}>Treatment:</Text>
                    <View style={styles.prescriptionBox}>
                      <Text style={styles.prescriptionText}>{appointment.prescription.treatment}</Text>
                    </View>
                  </View>
                )}
              </View>
              
              {appointment.prescription.medicines && appointment.prescription.medicines.length > 0 && (
                <View style={styles.medicineTable}>
                  <Text style={styles.prescriptionLabel}>Prescribed Medicines:</Text>
                  <View style={styles.medicineTableHeader}>
                    <Text style={[styles.medicineTableHeaderText, styles.medicineName]}>Medicine</Text>
                    <Text style={[styles.medicineTableHeaderText, styles.medicineDosage]}>Dosage</Text>
                    <Text style={[styles.medicineTableHeaderText, styles.medicineFrequency]}>Frequency</Text>
                    <Text style={[styles.medicineTableHeaderText, styles.medicineDuration]}>Duration</Text>
                  </View>
                  {appointment.prescription.medicines.map((medicine, index) => (
                    <View key={index} style={styles.medicineTableRow}>
                      <Text style={[styles.medicineTableCellBold, styles.medicineName]}>{medicine.name}</Text>
                      <Text style={[styles.medicineTableCell, styles.medicineDosage]}>{medicine.dosage}</Text>
                      <Text style={[styles.medicineTableCell, styles.medicineFrequency]}>{medicine.frequency}</Text>
                      <Text style={[styles.medicineTableCell, styles.medicineDuration]}>{medicine.duration}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for choosing Aartiket Speech & Hearing Care</Text>
          <Text style={styles.footerSubtext}>For any queries, please contact us at 79 7748 3031 or email aartiketspeechandhearing@gmail.com</Text>
          <Text style={styles.footerTimestamp}>
            Generated on {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default BillPDF;