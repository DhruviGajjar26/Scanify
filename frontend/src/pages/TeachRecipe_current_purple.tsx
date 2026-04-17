import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Save, StopCircle, Minus, Square, Maximize2 } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { getRecipeById, updateRecipe } from '../api/recipes';
import './TeachRecipe.css';

const TeachRecipe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Floating window states
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isSelectorVisible, setIsSelectorVisible] = useState(true);

  const [formData, setFormData] = useState({
    trainFile: 'eng',
    datatypes: 'ASCII',
    psmValue: '3',
    oemValue: '3',
    scaleFactor: 0,
    erode: 0,
    dilate: 0,
    smooth: 0,
    thresholdMethod: 'Binary',
    thresholdMin: 100,
    thresholdMax: 255,
    charMin: 5,
    charMax: 15,
    whiteOnBlack: false,
    triggerDelay: 500,
    count: 1
  });

  const [boxPosition, setBoxPosition] = useState({ x: 20, y: 150 });
  const [boxSize, setBoxSize] = useState({ width: 380, height: 180 });
  const [selectorPosition, setSelectorPosition] = useState({ x: 20, y: 20 });
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (id) {
      getRecipeById(id)
        .then(data => {
          if (data.config) {
            setFormData(prev => ({ ...prev, ...data.config }));
            if (data.config.boxPosition) setBoxPosition(data.config.boxPosition);
            if (data.config.boxSize) setBoxSize(data.config.boxSize);
            if (data.config.selectorPosition) setSelectorPosition(data.config.selectorPosition);
            showToast('Loaded config from Database', 'success');
          }
        })
        .catch(() => showToast('Ready for new recipe configuration', 'info'));
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveRecipe = async () => {
    const fullConfig = { ...formData, boxPosition, boxSize, selectorPosition };
    try {
      if (id) {
        await updateRecipe(id, fullConfig);
        showToast('Saved recipe securely to Backend DB!', 'success');
      } else {
        showToast('No recipe ID found. Cannot save.', 'error');
      }
    } catch {
      showToast('Error saving recipe to backend!', 'error');
    }
  };

  const handleGetData = () => showToast(`Extracted ASCII data using ${formData.trainFile} model with Method: ${formData.thresholdMethod}`, 'success');
  const handleSingleCapture = () => showToast(`Single frame captured. Delay elapsed: ${formData.triggerDelay}ms`, 'info');
  const handleContinuousCapture = () => showToast(`Started continuous capture limit ${formData.count} at ${formData.triggerDelay}ms delay.`, 'info');
  const handleResetCapture = () => showToast('Resetting capture buffer...', 'info');
  const handleCompareOCR = () => showToast(`Comparing OCR output (PSM: ${formData.psmValue}, OEM: ${formData.oemValue}) against truth data...`, 'info');
  const handleStartPreview = () => { setIsPreviewMode(true); showToast('Preview Mode Started!', 'success'); };
  const handleStopPreview = () => setIsPreviewMode(false);

  return (
    <div className="teach-recipe-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-2xl z-50 text-white text-sm font-semibold tracking-wide transition-all duration-300 ${
          toastMessage.type === 'success' ? 'bg-green-600' :
          toastMessage.type === 'error' ? 'bg-red-600' : 'bg-violet-600'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="teach-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/recipes')} className="header-close-btn">
            <X className="w-5 h-5" />
          </button>
          <span>{isPreviewMode ? 'Preview Mode' : `Teach Recipe ${id ? `— ${id.substring(0, 8)}` : ''}`}</span>
        </div>
        <span className="text-sm font-normal opacity-50">{new Date().toLocaleString()}</span>
      </div>

      {/* Main Workspace */}
      <div className="teach-main relative">

        {/* ── Floating Image Selector Window ── */}
        {!isPreviewMode && isSelectorVisible && (
          <Rnd
            position={{ x: selectorPosition.x, y: selectorPosition.y }}
            onDragStop={(e, d) => setSelectorPosition({ x: d.x, y: d.y })}
            bounds="parent"
            enableResizing={false}
            dragHandleClassName="fw-drag-handle"
            className="z-40"
            style={{ position: 'absolute' }}
          >
            <div className={`floating-window ${isMaximized ? 'fw-maximized' : ''}`}>

              {/* Floating Window Header */}
              <div className="fw-header fw-drag-handle">
                <span>Image Selector</span>
                {/* Window Control Buttons */}
                <div className="fw-window-controls">
                  {/* Minimize */}
                  <button
                    className="fw-ctrl-btn fw-ctrl-minimize"
                    title="Minimize"
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(v => !v); }}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  {/* Maximize */}
                  <button
                    className="fw-ctrl-btn fw-ctrl-maximize"
                    title={isMaximized ? 'Restore' : 'Maximize'}
                    onClick={(e) => { e.stopPropagation(); setIsMaximized(v => !v); setIsMinimized(false); }}
                  >
                    {isMaximized ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </button>
                  {/* Close */}
                  <button
                    className="fw-ctrl-btn fw-ctrl-close"
                    title="Close"
                    onClick={(e) => { e.stopPropagation(); setIsSelectorVisible(false); }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Floating Window Body — hidden when minimized */}
              {!isMinimized && (
                <div className="fw-content">
                  <div className="folder-icon">O</div>
                  <div className="fw-controls">
                    <div className="trigger-delay">
                      <span>Trigger Delay :</span>
                      <input type="number" name="triggerDelay" value={formData.triggerDelay} onChange={handleInputChange} />
                      <span>Count :</span>
                      <input type="number" name="count" value={formData.count} onChange={handleInputChange} style={{ width: 50 }} />
                    </div>
                    <div className="fw-buttons">
                      <button className="fw-btn" onClick={handleSingleCapture}>Single</button>
                      <button className="fw-btn" onClick={handleContinuousCapture}>Continuous</button>
                      <button className="fw-btn" onClick={handleResetCapture}>Reset</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Rnd>
        )}

        {/* Restore button if selector was closed */}
        {!isPreviewMode && !isSelectorVisible && (
          <button
            className="selector-restore-btn"
            onClick={() => setIsSelectorVisible(true)}
          >
            + Image Selector
          </button>
        )}

        {/* ── Left Viewer Area ── */}
        <div className="viewer-area">
          <div
            className="document-mockup transition-transform duration-200 ease-out"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', width: '800px', minHeight: '1000px' }}
          >
            <div className="document-text select-none">
              <h3 className="font-bold mb-2">Large sculptures and statues</h3>
              <p>of marble, bronze wood look best when placed on the floor near the wall or in the corner. You can add indoor plants like the Philodendron, maranta to a room. Nothing cheap and gaudy should be displayed. You can even put books as they decorate and give character.</p>
              <div style={{ marginTop: '20px' }}>
                <p>The dining walls can be decorated with family portraits. Thick crockery and bright serviettes of thick coarse material should be used for informal and homely atmosphere. For formal occasion, one should use white or pastel - coloured napkins and fine</p>
              </div>
            </div>

            {/* Bounding Box */}
            <Rnd
              size={{ width: boxSize.width, height: boxSize.height }}
              position={{ x: boxPosition.x, y: boxPosition.y }}
              onDragStop={(e, d) => setBoxPosition({ x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) => {
                setBoxSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
                setBoxPosition(position);
              }}
              bounds="parent"
              className="border-2 border-red-500 z-10"
              style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(124,58,237,0.05))' }}
              dragHandleClassName="draggable-area"
              resizeHandleStyles={{
                topLeft:     { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,left:-5,top:-5,boxShadow:'0 0 4px rgba(124,58,237,0.7)' },
                topRight:    { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,right:-5,top:-5,boxShadow:'0 0 4px rgba(124,58,237,0.7)' },
                bottomLeft:  { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,left:-5,bottom:-5,boxShadow:'0 0 4px rgba(124,58,237,0.7)' },
                bottomRight: { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,right:-5,bottom:-5,boxShadow:'0 0 4px rgba(124,58,237,0.7)' },
                top:    { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,left:'50%',transform:'translateX(-50%)',top:-5 },
                bottom: { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,left:'50%',transform:'translateX(-50%)',bottom:-5 },
                left:   { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,top:'50%',transform:'translateY(-50%)',left:-5 },
                right:  { width:10,height:10,background:'linear-gradient(135deg,#a78bfa,#7c3aed)',borderRadius:2,top:'50%',transform:'translateY(-50%)',right:-5 },
              }}
            >
              <div className="draggable-area w-full h-full cursor-move" />
            </Rnd>
          </div>
        </div>

        {/* ── Right Properties Sidebar ── */}
        {isPreviewMode ? (
          <div className="properties-sidebar flex flex-col">
            <div className="sidebar-section-label">Extracted Result</div>
            <textarea
              className="flex-1 w-full p-3 text-sm resize-none focus:outline-none"
              readOnly
              value="The dining walls can be decorated with family portraits. Thick crockery and bright serviettes of thick coarse material should be used for informal and homely atmosphere. For formal occasion, one should use white or pastel - coloured napkins and fine"
            />
            <div className="sidebar-action-group mt-4 flex flex-col gap-3">
              <button className="btn-primary-small flex justify-center items-center gap-2 bg-red-700 hover:bg-red-800" onClick={handleStopPreview}>
                <StopCircle className="w-4 h-4" /> Stop Preview
              </button>
              <button className="btn-primary-small flex justify-center items-center gap-2" onClick={handleSaveRecipe}>
                <Save className="w-4 h-4" /> Save Recipe
              </button>
            </div>
          </div>
        ) : (
          <div className="properties-sidebar">

            {/* ── Section: Preview Snippet ── */}
            <div className="sidebar-section">
              <div className="sidebar-section-label">Preview</div>
              <div className="sidebar-preview-text">
                The dining walls can be decorated with family portraits. Thick crockery and bright serviettes of thick coarse material should be used for informal and homely atmosphere.
              </div>
            </div>

            {/* ── Section: OCR Engine ── */}
            <div className="sidebar-section">
              <div className="sidebar-section-label">OCR Engine</div>
              <div className="prop-group">
                <div className="sidebar-prop-row">
                  <label>Train File</label>
                  <select className="prop-control" name="trainFile" value={formData.trainFile} onChange={handleInputChange}>
                    <option value="eng">eng</option>
                    <option value="osd">osd</option>
                    <option value="hin">hin</option>
                  </select>
                </div>
                <div className="sidebar-divider" />
                <div className="sidebar-prop-row">
                  <label>Datatypes</label>
                  <select className="prop-control" name="datatypes" value={formData.datatypes} onChange={handleInputChange}>
                    <option value="ASCII">ASCII</option>
                    <option value="UTF8">UTF8</option>
                  </select>
                </div>
                <div className="sidebar-divider" />
                <div className="sidebar-prop-row">
                  <label>PSM Value</label>
                  <select className="prop-control" name="psmValue" value={formData.psmValue} onChange={handleInputChange}>
                    <option value="3">3</option>
                    <option value="6">6</option>
                    <option value="11">11</option>
                  </select>
                </div>
                <div className="sidebar-divider" />
                <div className="sidebar-prop-row">
                  <label>OEM Value</label>
                  <select className="prop-control" name="oemValue" value={formData.oemValue} onChange={handleInputChange}>
                    <option value="3">3</option>
                    <option value="1">1</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section: Image Processing ── */}
            <div className="sidebar-section">
              <div className="sidebar-section-label">Image Processing</div>
              <div className="prop-group">
                {[
                  ['ScaleFactor', 'scaleFactor'],
                  ['Erode',       'erode'],
                  ['Dilate',      'dilate'],
                  ['Smooth',      'smooth'],
                ].map(([label, name], i, arr) => (
                  <React.Fragment key={name}>
                    <div className="sidebar-prop-row">
                      <label>{label}</label>
                      <input type="number" className="prop-control-small" name={name} value={(formData as any)[name]} onChange={handleInputChange} />
                    </div>
                    {i < arr.length - 1 && <div className="sidebar-divider" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ── Section: Threshold ── */}
            <div className="sidebar-section">
              <div className="sidebar-section-label">Threshold</div>
              <div className="prop-group">
                <div className="sidebar-prop-row">
                  <label>Method</label>
                  <select className="prop-control" name="thresholdMethod" value={formData.thresholdMethod} onChange={handleInputChange}>
                    <option value="Binary">Binary</option>
                    <option value="Otsu">Otsu</option>
                  </select>
                </div>
                <div className="sidebar-divider" />
                <div className="sidebar-dual-row">
                  <div className="sidebar-dual-item">
                    <span className="sidebar-dual-label">Min</span>
                    <input type="number" className="prop-control-small" name="thresholdMin" value={formData.thresholdMin} onChange={handleInputChange} />
                  </div>
                  <div className="sidebar-dual-divider" />
                  <div className="sidebar-dual-item">
                    <span className="sidebar-dual-label">Max</span>
                    <input type="number" className="prop-control-small" name="thresholdMax" value={formData.thresholdMax} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section: Character Filter ── */}
            <div className="sidebar-section">
              <div className="sidebar-section-label">Character Filter</div>
              <div className="prop-group">
                <div className="sidebar-dual-row">
                  <div className="sidebar-dual-item">
                    <span className="sidebar-dual-label">Min</span>
                    <input type="number" className="prop-control-small" name="charMin" value={formData.charMin} onChange={handleInputChange} />
                  </div>
                  <div className="sidebar-dual-divider" />
                  <div className="sidebar-dual-item">
                    <span className="sidebar-dual-label">Max</span>
                    <input type="number" className="prop-control-small" name="charMax" value={formData.charMax} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="sidebar-divider" />
                <div className="sidebar-checkbox-row">
                  <input type="checkbox" id="whiteOnBlack" name="whiteOnBlack" checked={formData.whiteOnBlack} onChange={handleInputChange} />
                  <label htmlFor="whiteOnBlack" className="cursor-pointer select-none">WhiteOnBlack</label>
                </div>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="sidebar-action-group">
              <button className="sidebar-btn-secondary" onClick={handleGetData}>Get Data</button>
              <button className="sidebar-btn-primary" onClick={handleSaveRecipe}>
                <Save className="w-4 h-4" /> Save Recipe
              </button>
            </div>

          </div>
        )}
      </div>

      {/* ── Bottom Bar ── */}
      {!isPreviewMode && (
        <div className="bottom-bar">
          <div className="zoom-control">
            <span className="font-semibold text-sm">Zoom Level</span>
            <button className="zoom-btn" onClick={() => setZoomLevel(z => Math.max(0.2, parseFloat((z - 0.1).toFixed(1))))}>−</button>
            <input type="range" className="zoom-slider" min="0.2" max="3" step="0.1" value={zoomLevel} onChange={e => setZoomLevel(parseFloat(e.target.value))} />
            <button className="zoom-btn" onClick={() => setZoomLevel(z => Math.min(3, parseFloat((z + 0.1).toFixed(1))))}>+</button>
            <span className="font-mono text-sm w-12 text-right">{Math.round(zoomLevel * 100)}%</span>
          </div>
          <div className="bottom-buttons">
            <button className="bottom-btn-secondary" onClick={handleCompareOCR}>Compare OCR</button>
            <button className="bottom-btn-primary" onClick={handleStartPreview}>Start Preview</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachRecipe;