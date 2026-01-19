import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Course } from '../types';

interface CertificateValidatePageProps {
  courses?: Course[];
}

const CertificateValidatePage: React.FC<CertificateValidatePageProps> = ({ courses = [] }) => {
  const { code } = useParams();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [data, setData] = useState<any>(null);
  const [courseList, setCourseList] = useState<Course[]>(courses);

  useEffect(() => {
    const validate = async () => {
      if (!code) return setStatus('invalid');
      try {
        const result = await api.validateCertificate(code);
        setData(result.certificado);
        setStatus('valid');
      } catch (error) {
        setStatus('invalid');
      }
    };
    validate();
  }, [code]);

  useEffect(() => {
    if (courseList.length > 0) return;
    const loadCourses = async () => {
      try {
        const list = await api.getCourses();
        setCourseList(list);
      } catch (error) {
        console.error('Erro ao buscar cursos:', error);
      }
    };
    loadCourses();
  }, [courseList.length]);

  const course = data?.courseId ? courseList.find(c => c.id === data.courseId) : null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        {status === 'loading' && (
          <p className="text-gray-500">Validando certificado...</p>
        )}
        {status === 'invalid' && (
          <>
            <h2 className="text-2xl font-serif font-bold text-red-600 mb-3">Certificado inválido</h2>
            <p className="text-gray-600">Não foi possível validar este certificado.</p>
          </>
        )}
        {status === 'valid' && (
          <>
            <h2 className="text-2xl font-serif font-bold text-rm-green mb-3">Certificado válido</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p><span className="font-bold">Código:</span> {data.code}</p>
              <p><span className="font-bold">Curso:</span> {course?.title || data.courseId}</p>
              <p><span className="font-bold">Instrutor:</span> {course?.creatorName || 'Instrutor'}</p>
              <p><span className="font-bold">Aluno:</span> {data.email}</p>
              <p><span className="font-bold">Conclusão:</span> {new Date(data.completedAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CertificateValidatePage;
