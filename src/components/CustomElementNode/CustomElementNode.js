import React from 'react';
import { Handle } from 'reactflow';

const CustomElementNode = ({ data, icon, isConnectable }) => {
  return (
    <>
      <Handle position="top" type="target" isConnectable={isConnectable} />
      <div className="card-option border-solid border-[1px] h-20 max-w-full flex flex-col items-center justify-center m-0  w-[200px] bg-white">
        {icon}
        <h3 className="text-lg">{data.label}</h3>
      </div>
      <Handle position="bottom" type="source" isConnectable={isConnectable} />
    </>
  );
};

export default CustomElementNode;
