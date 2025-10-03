import { Link } from "react-router-dom";

const OperationCard = ({ title, description, route, icon }) => {
  // Get appropriate icon based on route if icon prop not provided
  const getIcon = (route) => {
    switch (route) {
      case '/merge-pdf':
        return '🗂️';
      case '/split-pdf':
        return '✂️';
      case '/remove-pages':
        return '❌';
      case '/extract-pages':
        return '📄';
      case '/organize-pdf':
        return '🗃️';
      case '/rotate-pdf':
        return '🔄';
      case '/compress-pdf':
        return '📉';
      case '/jpg-to-pdf':
        return '🖼️';
      case '/word-to-pdf':
        return '📄';
      case '/ppt-to-pdf':
        return '📊';
      case '/excel-to-pdf':
        return '📈';
      case '/html-to-pdf':
        return '🌐';
      case '/pdf-to-jpg':
        return '🖼️';
      case '/pdf-to-word':
        return '📄';
      case '/pdf-to-ppt':
        return '📊';
      case '/pdf-to-excel':
        return '📈';
      case '/pdf-to-pdfa':
        return '🗄️';
      case '/add-page-numbers':
        return '🔢';
      case '/add-watermark':
        return '💧';
      case '/unlock-pdf':
        return '🔓';
      case '/protect-pdf':
        return '🔒';
      case '/sign-pdf':
        return '✍️';
      case '/compare-pdf':
        return '🆚';
      default:
        return '🛠️';
    }
  };

  return (
    <Link to={route} className="block transition">
      <div
        className="bg-[#008080]  border border-[#e6e7eb] rounded-lg shadow-sm px-5 py-5 hover:border-gold transition-colors duration-150 min-h-[200px] flex flex-col items-start justify-center"
      >
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-md text-3xl mb-3" style={{ fontSize: '32px' }}>
          {icon || getIcon(route)}
        </span>
        <h3 className="text-[20px] font-bold text-green-400 text-left mb-2 leading-tight">{title}</h3>
        <p className="text-white text-[15px] text-left leading-snug">{description}</p>
      </div>
    </Link>
  );
};

export default OperationCard;
// import { Link } from "react-router-dom";

// const OperationCard = ({ title, description, route, icon = "🛠️" }) => {
//   return (
//     <Link to={route} className="block hover:shadow-xl transition">
//       <div className="bg-white shadow p-6 rounded-lg cursor-pointer hover:bg-indigo-50">
//         {/* Title */}
//         <h3 className="text-xl font-semibold text-indigo-600">{title}</h3>

//         {/* Icon */}
//         <div className="text-2xl my-2">{icon}</div>

//         {/* Description */}
//         <p className="text-gray-600">{description}</p>
//       </div>
//     </Link>
//   );
// };

// export default OperationCard;
