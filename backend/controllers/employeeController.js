const Employee = require('../models/employeeModel');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.getAll();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.getManagers = async (req, res) => {
  try {
    const managers = await Employee.getManagers();
    res.json(managers);
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.getById(id);
    if (!employee) return res.status(404).json({ message: 'Employee not found!' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.addEmployee = async (req, res) => {
  try {
    const result = await Employee.create(req.body);
    res.json({ id: result.id, message: 'Employee added successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await Employee.update(id, req.body);
    res.json({ message: 'Employee updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await Employee.delete(id);
    res.json({ message: 'Employee deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};
