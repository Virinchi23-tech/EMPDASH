import React from 'react';

const BonusTable = ({ bonuses }) => {
  return (
    <div className="table-custom shadow-sm border-0 mt-4">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Amount</th>
            <th>Reason</th>
            <th>Date Given</th>
          </tr>
        </thead>
        <tbody>
          {bonuses.map((bonus) => (
            <tr key={bonus.id}>
              <td>{bonus.employee_name}</td>
              <td className="fw-bold text-success">${bonus.bonus_amount.toLocaleString()}</td>
              <td>{bonus.bonus_reason}</td>
              <td>{bonus.date_given}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BonusTable;
