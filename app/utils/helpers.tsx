// utils/helpers.js
export const generateDummyData = () => [
  {
    id: "L-1009",
    status: "Working",
    voltage: 8.4,
    current: 124,
    lastUpdated: "2 min ago",
    location: "MG Road, Block A",
  },

  {
    id: "L-1002",
    status: "Offline",
    voltage: 4.2,
    current: 118,
    lastUpdated: "5 min ago",
    location: "Sector 12, Main Square",
  },
  {
    id: "L-1005",
    status: "Fault",
    voltage: null,
    current: null,
    lastUpdated: "1 hour ago",
    location: "Civil Lines, Block C",
  },
];

export const repairmen = [
  {
    id: 1,
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    distanceFromL1002: 1.2,
    distanceFromL1005: 2.5,
    distanceFromL1009: 0.8,
    distanceFromL1004: 2.0,
    distanceFromL1008: 1.5,
    avatar: "person-circle-outline",
  },
  {
    id: 2,
    name: "Priya Sharma",
    phone: "+91 87654 32109",
    distanceFromL1002: 2.8,
    distanceFromL1005: 1.5,
    distanceFromL1009: 3.2,
    distanceFromL1004: 1.2,
    distanceFromL1008: 2.8,
    avatar: "person-circle-outline",
  },
  {
    id: 3,
    name: "Amit Verma",
    phone: "+91 99887 66554",
    distanceFromL1002: 0.5,
    distanceFromL1005: 3.0,
    distanceFromL1009: 2.1,
    distanceFromL1004: 3.5,
    distanceFromL1008: 0.9,
    avatar: "person-circle-outline",
  },
  {
    id: 4,
    name: "Sunil Patel",
    phone: "+91 76543 21098",
    distanceFromL1002: 3.5,
    distanceFromL1005: 0.9,
    distanceFromL1009: 4.0,
    distanceFromL1004: 2.5,
    distanceFromL1008: 3.2,
    avatar: "person-circle-outline",
  },
];

export const getNearestRepairman = (lightId) => {
  let repairmanWithDistance = repairmen.map((rep) => {
    let distance = 999;
    if (lightId === "L-1002") distance = rep.distanceFromL1002;
    else if (lightId === "L-1005") distance = rep.distanceFromL1005;
    else if (lightId === "L-1009") distance = rep.distanceFromL1009;
    else if (lightId === "L-1004") distance = rep.distanceFromL1004;
    else if (lightId === "L-1008") distance = rep.distanceFromL1008;
    else distance = Math.random() * 5;
    return { ...rep, distance };
  });
  repairmanWithDistance.sort((a, b) => a.distance - b.distance);
  return repairmanWithDistance[0];
};

export const getStatusStyle = (status) => {
  switch (status) {
    case "Working":
      return { color: "#10B981", label: "Working", glow: "#10B98180" };
    case "Fault":
      return { color: "#EF4444", label: "Fault", glow: "#EF444480" };
    case "Power Failure":
      return { color: "#EF4444", label: "Power Failure", glow: "#EF444480" };
    case "Offline":
      return { color: "#F59E0B", label: "Offline", glow: "#F59E0B80" };
    default:
      return { color: "#9CA3AF", label: "Unknown", glow: "#9CA3AF80" };
  }
};
