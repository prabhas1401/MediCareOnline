import React from 'react';

const Form = ({ fields, onSubmit, buttonText }) => {
  const [formData, setFormData] = React.useState(fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      {fields.map((field, index) => (
        <div key={index} className="form-group">
          {field.type === 'select' ? (
            <select name={field.name} value={formData[field.name]} onChange={handleChange} required={field.required}>
              <option value="">{field.placeholder}</option>
              {field.options.map((option, i) => <option key={i} value={option.value}>{option.label}</option>)}
            </select>
          ) : (
            <input type={field.type} name={field.name} placeholder={field.placeholder} value={formData[field.name]} onChange={handleChange} required={field.required} />
          )}
        </div>
      ))}
      <button type="submit" className="btn btn-primary">{buttonText}</button>
    </form>
  );
};

export default Form;