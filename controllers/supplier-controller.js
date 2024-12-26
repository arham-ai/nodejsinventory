const dbConnection = require('../dbConnection');
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const multer = require("multer");


exports.addSupplier = async (req, res) => {
  try {
    const { company_name, email, phone_no, ref_person, ref_person_phone_no, category_id, sub_category_id, about_supplier
    } = req.body;

    if (!company_name || !ref_person || !ref_person_phone_no || !category_id) {
      return res.status(400).json({ message: "Required fields are missing." });
    }
    const [categoryExists] = await dbConnection.execute(
      `SELECT * FROM categories WHERE category_id = ?`,
      [category_id]
    );

    if (categoryExists.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (sub_category_id) {
      const [subCategoryExists] = await dbConnection.execute(
        `SELECT * FROM sub_category WHERE sub_category_id = ?`,
        [sub_category_id]
      );

      if (subCategoryExists.length === 0) {
        return res.status(404).json({ message: "Sub-category not found" });
      }
    }

    const supplierAbout = about_supplier ? about_supplier : null;

    const [addSupplier] = await dbConnection.execute(
      `INSERT INTO suppliers (company_name, email, phone_no, ref_person, ref_person_phone_no, category_id, sub_category_id, about_supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, email, phone_no, ref_person, ref_person_phone_no, category_id, sub_category_id || null, supplierAbout]
    );

    if (addSupplier.affectedRows === 1) {
      return res.status(201).json({
        message: "Supplier added successfully"
      });
    } else {
      return res.status(500).json({
        message: "Could not add supplier"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message
    });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { supplier_id, company_name, email, phone_no, ref_person, ref_person_phone_no, category_id, sub_category_id, about_supplier } = req.body;

    const [checkExistence] = await dbConnection.execute(`SELECT * FROM suppliers WHERE supplier_id = ?`, [supplier_id]);
    if (checkExistence.length < 1) {
      return res.status(400).json({
        message: "Supplier does not exist"
      });
    }

    const [updateSupplier] = await dbConnection.execute(
      `UPDATE suppliers SET company_name = ?, email = ?, phone_no = ?,ref_person=?,ref_person_phone_no=?, category_id = ?,sub_category_id=?, about_supplier = ? WHERE supplier_id = ?`,
      [company_name, email, phone_no, ref_person, ref_person_phone_no, category_id, sub_category_id, about_supplier, supplier_id]
    );

    if (updateSupplier.affectedRows === 1) {
      return res.status(200).send({
        message: "Supplier updated successfully"
      });
    } else {
      return res.status(500).json({
        message: "Could not update supplier"
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: err.message
    });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const [deleteSupplier] = await dbConnection.execute(`DELETE FROM suppliers WHERE supplier_id = ?`, [req.body.supplier_id]);

    return res.status(200).json({
      message: "Supplier deleted successfully"
    });

  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

exports.getAllSuppliers = async (req, res) => {
  try {
    const [getAllSuppliers] = await dbConnection.execute(`select s.*,c.category_name,sc.sub_category_name from suppliers s
                    left join categories c on s.category_id = c.category_id 
                    left join sub_category sc on sc.sub_category_id = s.sub_category_id`);
    return res.status(200).json({
      message: "Supplier retrieved successfully",
      data: getAllSuppliers
    });
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const { supplier_id } = req.params;
    const [getSupplierById] = await dbConnection.execute(`select s.*,c.category_name,sc.sub_category_name from suppliers s
                    left join categories c on s.category_id = c.category_id 
                    left join sub_category sc on sc.sub_category_id = s.sub_category_id where supplier_id=?`, [supplier_id]);

    return res.status(200).json({
      message: "supplier retrieved successfully",
      data: getSupplierById[0]
    });
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};
