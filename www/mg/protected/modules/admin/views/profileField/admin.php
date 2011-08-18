<?php
$this->breadcrumbs=array(
  Yii::t('app', 'Admin')=>array('/admin'),
  UserModule::t('Users')=>array('/admin/user'),
  UserModule::t('Profile Fields'),
);

$this->menu = array(
    array('label'=>UserModule::t('Create Profile Field'), 'url'=>array('create')),
  );


?>
<h1><?php echo UserModule::t('Manage Profile Fields'); ?></h1>

<?php $this->widget('zii.widgets.grid.CGridView', array(
	'dataProvider'=>$dataProvider,
	'columns'=>array(
		'id',
		'varname',
		array(
			'name'=>'title',
			'value'=>'UserModule::t($data->title)',
		),
		'field_type',
		'field_size',
		//'field_size_min',
		array(
			'name'=>'required',
			'value'=>'ProfileField::itemAlias("required",$data->required)',
		),
		//'match',
		//'range',
		//'error_message',
		//'other_validator',
		//'default',
		'position',
		array(
			'name'=>'visible',
			'value'=>'ProfileField::itemAlias("visible",$data->visible)',
		),
		//*/
		array(
			'class'=>'CButtonColumn',
		),
	),
)); ?>
