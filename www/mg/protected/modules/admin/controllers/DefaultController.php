<?php

class DefaultController extends Controller
{
	public function actionIndex()
	{
		if (Yii::app()->user->checkAccess('editor')) {
      // renders the view file 'protected/views/admin/index.php'
      // using the default layout 'protected/views/layouts/main.php'
      
      $tools = array();
      
      $tools["tool-subject-matter"] = array(
                              "name" => Yii::t('app', "Subject Matters"),
                              "description" => Yii::t('app', "Some short description"),
                              "url" => $this->createUrl('/admin/subjectmatter'),
                           );
      
      $tools["tool-image-set"] = array(
                              "name" => Yii::t('app', "Image Sets"),
                              "description" => Yii::t('app', "Some short description"),
                              "url" => $this->createUrl('/admin/imageset'),
                           );
      
      $tools["tool-licence"] = array(
                              "name" => Yii::t('app', "Licences"),
                              "description" => Yii::t('app', "Some short description"),
                              "url" => $this->createUrl('/admin/imageset'),
                           );
      
      if (Yii::app()->user->checkAccess('dbmanager')) {
        $tools["tool-user"] = array(
                              "name" => Yii::t('app', "User Manager"),
                              "description" => Yii::t('app', "Some short description"),
                              "url" => $this->createUrl('/admin/user'),
                           );
      }
                           
      $this->render('index',
        array (
          'tools' => $tools 
        )
      );  
    } else {
      throw new CHttpException(403, Yii::t('app', 'Access Denied.'));
    }
	}
}