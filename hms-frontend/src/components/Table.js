import React from 'react';

const Table = ({ headers, data, actions }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          {headers.map((header, index) => <th key={index}>{header}</th>)}
          {actions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {headers.map((header) => <td key={header}>{row[header.toLowerCase()]}</td>)}
            {actions && <td>{actions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;