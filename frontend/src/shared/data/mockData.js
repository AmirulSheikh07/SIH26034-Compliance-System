// SIH 26034 - PackSure: Legal Metrology Compliance System
// Mock Database (Simulating PostgreSQL/SQLAlchemy schemas exactly as decided in Team Contract)

// Import local product assets copied by the user
import redLabelImg from '../../assets/red_label.jpg';
import almondOilImg from '../../assets/almond_oil.jpg';
import biscuitsImg from '../../assets/biscuits.jpg';
import maggiImg from '../../assets/maggi.jpg';

export const mockUsers = [
  {
    id: "USR-001",
    name: "Ramesh Kumar",
    email: "ramesh.kumar@gov.in",
    role: "Administrator",
    department: "Delhi Enforcement Division",
    status: "Active",
    lastActive: "2026-08-29T08:30:00Z"
  },
  {
    id: "USR-002",
    name: "Priya Sharma",
    email: "priya.sharma@gov.in",
    role: "Enforcement Officer",
    department: "Maharashtra State Metrology",
    status: "Active",
    lastActive: "2026-08-29T09:05:00Z"
  },
  {
    id: "USR-003",
    name: "Anil Mehta",
    email: "anil.mehta@gov.in",
    role: "Inspector",
    department: "UP West Metrology Division",
    status: "Active",
    lastActive: "2026-08-28T17:00:00Z"
  },
  {
    id: "USR-004",
    name: "Sunita Roy",
    email: "sunita.roy@gov.in",
    role: "Reviewer",
    department: "Central Metrology Directorate",
    status: "Active",
    lastActive: "2026-08-29T09:08:00Z"
  },
  {
    id: "USR-005",
    name: "Vikram Malhotra",
    email: "vikram.m@gov.in",
    role: "Inspector",
    department: "Karnataka State Metrology",
    status: "Inactive",
    lastActive: "2026-08-15T12:00:00Z"
  }
];

export const mockProducts = [
  {
    id: "PROD-001",
    product_name: "Red Label Tea 500g",
    brand: "Brooke Bond",
    barcode: "8901030753018",
    category: "Food & Beverages",
    manufacturer: "Hindustan Unilever Limited, Unilever House, B.D. Sawant Marg, Chakala, Andheri (E), Mumbai - 400099",
    imageUrl: redLabelImg,
    created_at: "2026-08-10T11:20:00Z"
  },
  {
    id: "PROD-002",
    product_name: "Pure Almond Oil 100ml",
    brand: "Baidyanath",
    barcode: "8901491101838",
    category: "Cosmetics & Personal Care",
    manufacturer: "Shree Baidyanath Ayurved Bhawan Pvt Ltd, Great Nag Road, Nagpur - 440024",
    imageUrl: almondOilImg,
    created_at: "2026-08-12T09:15:00Z"
  },
  {
    id: "PROD-003",
    product_name: "Digestive High Fibre Biscuits",
    brand: "Britannia",
    barcode: "8901262010016",
    category: "Food & Beverages",
    manufacturer: "Britannia Industries Ltd, 5/1A Hungerford Street, Kolkata - 700017",
    imageUrl: biscuitsImg,
    created_at: "2026-08-05T10:00:00Z"
  },
  {
    id: "PROD-004",
    product_name: "Instant Noodles Masala 70g",
    brand: "Maggi",
    barcode: "8901058002310",
    category: "Food & Beverages",
    manufacturer: "Nestle India Limited, M-5A, Connaught Circus, New Delhi - 110001",
    imageUrl: maggiImg,
    created_at: "2026-08-18T16:00:00Z"
  }
];

export const mockScans = [
  {
    id: "SCN-2026-0001",
    product_id: "PROD-002",
    product_name: "Pure Almond Oil 100ml",
    brand: "Baidyanath",
    product_barcode: "8901491101838",
    inspector_id: "USR-003",
    inspector_name: "Anil Mehta",
    location: "Reliance Smart, Sector 18, Noida",
    scan_date: "2026-08-29T08:12:00Z",
    compliance_status: "NON_COMPLIANT",
    image_url: almondOilImg,
    
    // Extracted Data Table mapping
    extracted_data: {
      manufacturer: "Shree Baidyanath Ayurved Bhawan Pvt Ltd",
      address: "Great Nag Road, Nagpur - 440024",
      mrp: "₹185",
      net_quantity: "100 ml",
      manufacture_date: "05/2026",
      consumer_care: "Tel: 1800-102-2233"
    },

    // Compliance Engine Output Checks mapping
    checks: [
      {
        field: "manufacturer",
        status: "PASS",
        message: "manufacturer declaration detected",
        confidence: 0.95,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [50, 600, 250, 40]
      },
      {
        field: "address",
        status: "PASS",
        message: "address declaration detected",
        confidence: 0.92,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [50, 640, 250, 40]
      },
      {
        field: "mrp",
        status: "PASS",
        message: "mrp declaration detected",
        confidence: 0.89,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [150, 420, 80, 25]
      },
      {
        field: "net_quantity",
        status: "PASS",
        message: "net_quantity declaration detected",
        confidence: 0.98,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [100, 200, 50, 20]
      },
      {
        field: "manufacturing_date",
        status: "PASS",
        message: "manufacturing_date declaration detected",
        confidence: 0.87,
        confidence_level: "MEDIUM",
        review_required: false,
        bounding_box: [80, 300, 60, 20]
      },
      {
        field: "consumer_care",
        status: "FAIL",
        message: "Consumer care contact appears invalid",
        confidence: 0.42,
        confidence_level: "LOW",
        review_required: true,
        bounding_box: [320, 680, 150, 40]
      }
    ],

    // Violations Table mapping
    violations: [
      {
        id: "VIO-101",
        scan_id: "SCN-2026-0001",
        rule_id: "LM-CONSUMER-CARE",
        violation: "Invalid consumer care contact",
        severity: "MEDIUM",
        evidence: "Detected 'Tel: 1800-102-2233' but details are below minimum readability font threshold."
      }
    ]
  },
  {
    id: "SCN-2026-0002",
    product_id: "PROD-003",
    product_name: "Digestive High Fibre Biscuits",
    brand: "Britannia",
    product_barcode: "8901262010016",
    inspector_id: "USR-002",
    inspector_name: "Priya Sharma",
    location: "D-Mart, Malad West, Mumbai",
    scan_date: "2026-08-26T15:30:00Z",
    compliance_status: "WARNING",
    image_url: biscuitsImg,
    
    extracted_data: {
      manufacturer: "Britannia Industries Ltd",
      address: "5/1A Hungerford Street, Kolkata - 700017",
      mrp: "₹45",
      net_quantity: "150 g",
      manufacture_date: "AUG-26",
      consumer_care: "Email: feedback@britindia.com, Tel: 1800-425-4449"
    },

    checks: [
      {
        field: "manufacturer",
        status: "PASS",
        message: "manufacturer declaration detected",
        confidence: 0.97,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [60, 480, 200, 35]
      },
      {
        field: "address",
        status: "PASS",
        message: "address declaration detected",
        confidence: 0.94,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [60, 515, 200, 35]
      },
      {
        field: "mrp",
        status: "PASS",
        message: "mrp declaration detected",
        confidence: 0.92,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [200, 310, 70, 20]
      },
      {
        field: "net_quantity",
        status: "PASS",
        message: "net_quantity declaration detected",
        confidence: 0.96,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [110, 180, 60, 20]
      },
      {
        field: "manufacturing_date",
        status: "FAIL",
        message: "Manufacturing date format appears invalid",
        confidence: 0.81,
        confidence_level: "MEDIUM",
        review_required: false,
        bounding_box: [80, 210, 110, 30]
      },
      {
        field: "consumer_care",
        status: "PASS",
        message: "consumer_care declaration detected",
        confidence: 0.95,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [400, 600, 180, 35]
      }
    ],

    violations: [
      {
        id: "VIO-102",
        scan_id: "SCN-2026-0002",
        rule_id: "LM-DATE-FORMAT",
        violation: "Ambiguous packing date format",
        severity: "MEDIUM",
        evidence: "Month and Year of packing is written as 'AUG-26'. Standard rule recommends numeric representations MM/YYYY."
      }
    ]
  },
  {
    id: "SCN-2026-0003",
    product_id: "PROD-001",
    product_name: "Red Label Tea 500g",
    brand: "Brooke Bond",
    product_barcode: "8901030753018",
    inspector_id: "USR-002",
    inspector_name: "Priya Sharma",
    location: "D-Mart, Malad West, Mumbai",
    scan_date: "2026-08-28T14:45:00Z",
    compliance_status: "COMPLIANT",
    image_url: redLabelImg,
    
    extracted_data: {
      manufacturer: "Hindustan Unilever Limited",
      address: "Unilever House, Chakala, Mumbai - 400099",
      mrp: "₹230",
      net_quantity: "500 g",
      manufacture_date: "07/2026",
      consumer_care: "Email: lever.care@unilever.com, Tel: 1800-10-22-221"
    },

    checks: [
      {
        field: "manufacturer",
        status: "PASS",
        message: "manufacturer declaration detected",
        confidence: 0.99,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [100, 500, 300, 40]
      },
      {
        field: "address",
        status: "PASS",
        message: "address declaration detected",
        confidence: 0.98,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [100, 540, 300, 40]
      },
      {
        field: "mrp",
        status: "PASS",
        message: "mrp declaration detected",
        confidence: 0.99,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [180, 290, 80, 22]
      },
      {
        field: "net_quantity",
        status: "PASS",
        message: "net_quantity declaration detected",
        confidence: 0.99,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [90, 150, 70, 22]
      },
      {
        field: "manufacturing_date",
        status: "PASS",
        message: "manufacturing_date declaration detected",
        confidence: 0.97,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [70, 280, 80, 22]
      },
      {
        field: "consumer_care",
        status: "PASS",
        message: "consumer_care declaration detected",
        confidence: 0.98,
        confidence_level: "HIGH",
        review_required: false,
        bounding_box: [250, 610, 210, 30]
      }
    ],

    violations: []
  }
];

export const mockReports = [
  {
    reportId: "REP-2026-0001",
    inspectionId: "SCN-2026-0001",
    productName: "Pure Almond Oil 100ml",
    reportType: "Non-Compliance Notice (Seizure)",
    generatedBy: "Anil Mehta",
    date: "2026-08-29T08:20:00Z",
    status: "Signed & Issued"
  },
  {
    reportId: "REP-2026-0002",
    inspectionId: "SCN-2026-0002",
    productName: "Digestive High Fibre Biscuits",
    reportType: "Warning Advisory",
    generatedBy: "Priya Sharma",
    date: "2026-08-26T16:00:00Z",
    status: "Draft"
  }
];

export const mockNotifications = [
  {
    id: "NTF-001",
    title: "Violation Flagged",
    message: "Pure Almond Oil 100ml failed consumer_care checks.",
    timestamp: "2026-08-29T08:12:00Z",
    type: "ERROR",
    read: false,
    link: "/inspections/SCN-2026-0001"
  },
  {
    id: "NTF-002",
    title: "Review Requested",
    message: "Pure Almond Oil 100ml requires manual text confirmation.",
    timestamp: "2026-08-29T07:30:00Z",
    type: "WARNING",
    read: false,
    link: "/inspections/SCN-2026-0001"
  },
  {
    id: "NTF-003",
    title: "Report Approved",
    message: "Warning Advisory for Digestive Biscuits is ready for download.",
    timestamp: "2026-08-26T16:05:00Z",
    type: "SUCCESS",
    read: true,
    link: "/reports"
  }
];
