import './App.css';
import { dataPanel } from './utils/data';
import { useState, useCallback, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from 'reactflow';

import 'reactflow/dist/style.css';
import {
  MdCropOriginal,
  MdCenterFocusStrong,
  MdCenterFocusWeak,
} from 'react-icons/md';

import CustomElementNode from './components/CustomElementNode/CustomElementNode';

let id = 0;
const getId = () => `dndnode_${id++}`;
const nodeTypes = {
  page: (props) => <CustomElementNode {...props} icon={<MdCropOriginal />} />,
  element: (props) => (
    <CustomElementNode {...props} icon={<MdCenterFocusStrong />} />
  ),
  'element-item': (props) => (
    <CustomElementNode {...props} icon={<MdCenterFocusWeak />} />
  ),
};

function App() {
  const reactFlowWrapper = useRef(null);

  const [show, setShow] = useState(false);
  const [optionToEdit, setOptionToEdit] = useState(null);
  const [defaultOptions, setDefaultOptions] = useState([...dataPanel]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const handleClose = () => {
    setShow(false);
    setOptionToEdit(null);
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const index = event.dataTransfer.getData('application/reactflow');

      const cardDropedInfo = defaultOptions[index];

      // check if the dropped element is valid
      if (!cardDropedInfo.hasOwnProperty('title')) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type: cardDropedInfo?.type,
        position,
        data: { label: `${cardDropedInfo?.title}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [defaultOptions, reactFlowInstance, setNodes]
  );

  const onDragStart = (event, index) => {
    event.dataTransfer.setData('application/reactflow', index);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleShow = (option) => {
    if (option.id === null) {
      setShow(true);
      return;
    }
    setOptionToEdit(option);
    setShow(true);
  };

  const handleEdit = (editedOption) => {
    if (defaultOptions && editedOption.id) {
      const newDefaultOptions = defaultOptions.map((option) => {
        if (option.id === editedOption.id) {
          return { ...option, ...editedOption };
        }
        return option;
      });
      setDefaultOptions(newDefaultOptions);
    } else {
      setDefaultOptions((prevValues) => [
        ...prevValues,
        {
          ...editedOption,
          type: 'element',
          id: `node_${defaultOptions.length + 1}`,
        },
      ]);
    }

    handleClose();
  };

  return (
    <div className="App">
      <main className="main flex">
        <div className="panel-container w-[320px] h-full overflow-y-auto overflow-x-hidden max-h-screen">
          {defaultOptions?.map((option, index) => {
            return (
              <div
                key={index}
                draggable
                onDragStart={(event) => onDragStart(event, index)}
                onClick={() => handleShow(option)}
                className="card-option border-solid border-[1px] h-20 max-w-full flex flex-col items-center justify-center "
              >
                <h3 className="text-lg">{option.title}</h3>
                <span className="text-base">{option.subTitle}</span>
              </div>
            );
          })}
          <div
            onClick={() => handleShow({ id: null })}
            className="card-option cursor-pointer border-solid border-[1px] h-20 max-w-full flex flex-col items-center justify-center "
          >
            <h3 className="text-lg">Add card</h3>
          </div>
        </div>
        <ReactFlowProvider>
          <div className="w-full" ref={reactFlowWrapper}>
            <ReactFlow
              fitView
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>
              {optionToEdit?.id ? 'Edit' : 'Create'} Option
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder=""
                  value={optionToEdit?.title || ''}
                  onChange={(e) =>
                    setOptionToEdit((prevValues) => ({
                      ...prevValues,
                      title: e.target.value,
                    }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Subtitle</Form.Label>
                <Form.Control
                  type="text"
                  value={optionToEdit?.subTitle || ''}
                  onChange={(e) =>
                    setOptionToEdit((prevValues) => ({
                      ...prevValues,
                      subTitle: e.target.value,
                    }))
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={() => handleEdit(optionToEdit)}>
              {optionToEdit?.id ? 'Edit' : 'Save'}
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
}

export default App;
